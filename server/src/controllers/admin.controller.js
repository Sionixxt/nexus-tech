const prisma = require('../config/database');
const { paginate, buildPaginationMeta, sanitizeUser } = require('../utils/helpers');

exports.getDashboard = async (req, res) => {
  try {
    // Basic metrics
    const [
      revenueResult,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      ordersByStatusGroup
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      }),
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          _count: { select: { items: true } }
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    // Calculate low stock products using a safe fallback
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { stock: true, lowStockAt: true }
    });
    
    const lowStockProductsCount = products.filter(
      p => p.stock <= (p.lowStockAt !== null && p.lowStockAt !== undefined ? p.lowStockAt : 10)
    ).length;

    // Monthly revenue logic
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const monthRev = await prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { totalAmount: true }
      });
      
      monthlyRevenue.push({
        month: monthStr,
        revenue: monthRev._sum.totalAmount || 0
      });
    }

    res.json({
      totalRevenue: revenueResult._sum.totalAmount || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      lowStockProducts: lowStockProductsCount,
      recentOrders: recentOrders.map(o => ({
        ...o,
        itemsCount: o._count.items
      })),
      ordersByStatus: ordersByStatusGroup.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {}),
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { status, paymentStatus, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where.orderNumber = { contains: search, mode: 'insensitive' };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders: orders.map(o => ({ ...o, itemsCount: o._count.items })),
      pagination: buildPaginationMeta(total, page, limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, adminNote } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    if (status === 'SHIPPED') {
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    let updatedOrder;

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      updatedOrder = await prisma.$transaction(async (prismaClient) => {
        const updated = await prismaClient.order.update({
          where: { id },
          data: updateData
        });

        for (const item of order.items) {
          await prismaClient.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
        return updated;
      });
    } else {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData
      });
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: { select: { orderItems: true } }
        }
      }),
      prisma.product.count()
    ]);

    res.json({
      products: products.map((p) => ({
        ...p,
        primaryImage: p.images?.[0] || null,
        soldCount: p._count?.orderItems || 0,
      })),
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { orders: true } }
        }
      }),
      prisma.user.count()
    ]);

    res.json({
      users: users.map(user => ({
        ...sanitizeUser(user),
        ordersCount: user._count?.orders || 0
      })),
      pagination: buildPaginationMeta(total, page, limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
