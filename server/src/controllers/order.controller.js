// ============================================================================
// Order Controller — Checkout, History, Details, Cancellation
// ============================================================================

const prisma = require('../config/database');
const {
  generateOrderNumber,
  calculateTax,
  calculateShipping,
  paginate,
  buildPaginationMeta,
} = require('../utils/helpers');

/**
 * POST /api/orders
 * Create an order from the user's cart
 */
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddressId, paymentMethodId, customerNote, discountAmount = 0 } = req.body;

    // Get user's cart with product details
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, price: true, stock: true, name: true, sku: true, weight: true, isActive: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    // Validate all items are active and in stock
    const issues = [];
    for (const item of cart.items) {
      if (!item.product.isActive) {
        issues.push({ product: item.product.name, issue: 'Product is no longer available' });
      } else if (item.product.stock < item.quantity) {
        issues.push({
          product: item.product.name,
          issue: 'Insufficient stock',
          requested: item.quantity,
          available: item.product.stock,
        });
      }
    }

    if (issues.length > 0) {
      return res.status(400).json({ error: 'Some items cannot be fulfilled.', details: issues });
    }

    // Calculate financials
    let subtotal = 0;
    let totalWeight = 0;

    for (const item of cart.items) {
      subtotal += item.quantity * parseFloat(item.product.price);
      totalWeight += item.quantity * parseFloat(item.product.weight || 0);
    }

    const taxAmount = calculateTax(subtotal);
    const shippingCost = calculateShipping(subtotal, totalWeight);
    const totalAmount = parseFloat((subtotal + taxAmount + shippingCost - discountAmount).toFixed(2));

    // Atomic transaction: create order + decrement stock + clear cart
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          shippingAddressId,
          customerNote: customerNote || null,
          subtotal,
          taxAmount,
          shippingCost,
          discountAmount,
          totalAmount,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          // Simulated payment: mark as paid immediately if paymentMethodId provided
          ...(paymentMethodId && {
            paymentStatus: 'PAID',
            paidAt: new Date(),
            stripePaymentId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          }),
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productSku: item.product.sku,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: parseFloat((item.quantity * parseFloat(item.product.price)).toFixed(2)),
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Get current user's order history (paginated)
 */
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skip, take, page, limit } = paginate(req.query.page, req.query.limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true } },
          items: {
            take: 1,
            select: { productName: true },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    res.json({
      orders: orders.map((o) => ({
        ...o,
        itemsCount: o._count.items,
        previewItem: o.items[0]?.productName || null,
      })),
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Get a specific order (must belong to user or user is admin)
 */
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to view this order.' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/cancel
 * Cancel an order (only if PENDING or CONFIRMED)
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        error: `Cannot cancel an order with status "${order.status}". Only PENDING or CONFIRMED orders can be cancelled.`,
      });
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return updated;
    });

    res.json({ order: cancelledOrder, message: 'Order cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};
