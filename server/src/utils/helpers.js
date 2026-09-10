// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Generate a human-readable order number: NXT-{timestamp}{random}
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NXT-${timestamp}${random}`;
};

/**
 * Calculate tax amount based on subtotal
 * @param {number} subtotal
 * @param {number} rate - Tax rate (default 8%)
 */
const calculateTax = (subtotal, rate = 0.08) => {
  return parseFloat((subtotal * rate).toFixed(2));
};

/**
 * Calculate shipping cost based on subtotal and total weight
 * Free shipping on orders over $500
 */
const calculateShipping = (subtotal, weightGrams = 0) => {
  if (subtotal >= 500) return 0;       // Free shipping
  if (weightGrams > 5000) return 29.99; // Heavy package
  if (weightGrams > 1000) return 14.99; // Medium package
  return 9.99;                          // Standard
};

/**
 * Parse pagination params with safe defaults and limits
 */
const paginate = (page = 1, limit = 12) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 12));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
};

/**
 * Build pagination metadata for API responses
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

/**
 * Remove sensitive fields from user object before sending to client
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
};

/**
 * Parse a decimal-safe price value
 */
const parsePrice = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
};

module.exports = {
  generateOrderNumber,
  calculateTax,
  calculateShipping,
  paginate,
  buildPaginationMeta,
  sanitizeUser,
  parsePrice,
};
