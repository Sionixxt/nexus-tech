const prisma = require('../config/database');
const { paginate, buildPaginationMeta } = require('../utils/helpers');

// getProducts
const getProducts = async (req, res, next) => {
  try {
    const { page, limit, category, search, minPrice, maxPrice, inStock, featured, sort } = req.query;
    
    const where = { isActive: true };
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    let orderBy = {};
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    } else {
      orderBy = { createdAt: 'desc' }; // default
    }
    
    const pagination = paginate(page, limit);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          category: {
            select: { name: true, slug: true }
          },
          images: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }),
      prisma.product.count({ where })
    ]);
    
    res.json({
      products,
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

// getProduct
const getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        specs: {
          orderBy: { position: 'asc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });
    
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id }
    });
    
    const reviewCount = allReviews.length;
    const avgRating = reviewCount > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
      : 0;
      
    res.json({
      product,
      avgRating,
      reviewCount
    });
  } catch (error) {
    next(error);
  }
};

// getFeaturedProducts
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      take: 8,
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });
    
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// getCategories
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    });
    
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// createProduct
const createProduct = async (req, res, next) => {
  try {
    const { 
      name, sku, slug, description, shortDesc, price, compareAt, 
      costPrice, stock, lowStockAt, brand, categoryId, isFeatured, 
      weight, metaTitle, metaDescription, images, specs 
    } = req.body;
    
    const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const createData = {
      name,
      sku,
      slug: productSlug,
      description,
      shortDesc,
      price: parseFloat(price),
      compareAt: compareAt ? parseFloat(compareAt) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      stock: parseInt(stock, 10),
      lowStockAt: lowStockAt ? parseInt(lowStockAt, 10) : null,
      brand,
      categoryId,
      isFeatured: isFeatured || false,
      weight: weight ? parseFloat(weight) : null,
      metaTitle,
      metaDescription,
    };
    
    if (images && images.length > 0) {
      createData.images = {
        create: images.map(img => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary || false,
          position: img.position || 0
        }))
      };
    }
    
    if (specs && specs.length > 0) {
      createData.specs = {
        create: specs.map(spec => ({
          key: spec.key,
          value: spec.value,
          position: spec.position || 0
        }))
      };
    }
    
    const product = await prisma.product.create({
      data: createData,
      include: {
        category: true,
        images: true,
        specs: true
      }
    });
    
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
};

// updateProduct
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, specs, ...updateFields } = req.body;
    
    if (updateFields.price) updateFields.price = parseFloat(updateFields.price);
    if (updateFields.compareAt) updateFields.compareAt = parseFloat(updateFields.compareAt);
    if (updateFields.costPrice) updateFields.costPrice = parseFloat(updateFields.costPrice);
    if (updateFields.stock) updateFields.stock = parseInt(updateFields.stock, 10);
    if (updateFields.lowStockAt) updateFields.lowStockAt = parseInt(updateFields.lowStockAt, 10);
    if (updateFields.weight) updateFields.weight = parseFloat(updateFields.weight);
    
    const updateData = { ...updateFields };
    
    if (images) {
      updateData.images = {
        deleteMany: {},
        create: images.map(img => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary || false,
          position: img.position || 0
        }))
      };
    }
    
    if (specs) {
      updateData.specs = {
        deleteMany: {},
        create: specs.map(spec => ({
          key: spec.key,
          value: spec.value,
          position: spec.position || 0
        }))
      };
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        specs: true
      }
    });
    
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

// deleteProduct
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ message: 'Product deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
