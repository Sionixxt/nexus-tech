const prisma = require('../config/database');
const { paginate, buildPaginationMeta } = require('../utils/helpers');

exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    const existingReview = await prisma.review.findFirst({
      where: { productId, userId }
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: { productId }
        }
      }
    });

    const isVerified = !!deliveredOrder;

    const review = await prisma.review.create({
      data: {
        rating,
        title,
        comment,
        isVerified,
        productId,
        userId
      },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const [reviews, total, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isVisible: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } }
      }),
      prisma.review.count({ where: { productId, isVisible: true } }),
      prisma.review.aggregate({
        where: { productId, isVisible: true },
        _avg: { rating: true }
      })
    ]);

    res.json({
      reviews,
      avgRating: aggregate._avg.rating || 0,
      pagination: buildPaginationMeta(total, page, limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({ where: { id } });

    res.json({ message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
