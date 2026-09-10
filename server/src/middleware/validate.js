// ============================================================================
// Input Validation & Sanitization Rules (express-validator)
// Prevents XSS & SQL Injection via strict input validation
// ============================================================================

const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return 400 with detailed errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed.',
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────────────

const registerRules = [
  body('email')
    .isEmail().withMessage('Valid email is required.')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character (!@#$%^&*).'),
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ max: 50 }).withMessage('First name must not exceed 50 characters.')
    .escape(),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters.')
    .escape(),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number.')
    .trim(),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Valid email is required.')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

const refreshTokenRules = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required.')
    .isHexadecimal().withMessage('Invalid token format.'),
];

// ── Product Validators ────────────────────────────────────────────────────

const productRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ max: 200 }).withMessage('Product name must not exceed 200 characters.')
    .escape(),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.'),
  body('price')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('categoryId')
    .notEmpty().withMessage('Category is required.')
    .isUUID().withMessage('Invalid category ID.'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required.')
    .isLength({ max: 50 }).withMessage('SKU must not exceed 50 characters.'),
  body('compareAt')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Compare-at price must be a positive number.'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand must not exceed 100 characters.')
    .escape(),
];

const productUpdateRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Product name must not exceed 200 characters.')
    .escape(),
  body('description')
    .optional()
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('categoryId')
    .optional()
    .isUUID().withMessage('Invalid category ID.'),
];

// ── Order Validators ──────────────────────────────────────────────────────

const createOrderRules = [
  body('shippingAddressId')
    .notEmpty().withMessage('Shipping address is required.')
    .isUUID().withMessage('Invalid address ID.'),
  body('paymentMethodId')
    .optional()
    .trim()
    .notEmpty().withMessage('Payment method ID is required for payment.'),
  body('customerNote')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Note must not exceed 500 characters.')
    .escape(),
];

const updateOrderStatusRules = [
  param('id')
    .isUUID().withMessage('Invalid order ID.'),
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Invalid order status.'),
  body('trackingNumber')
    .optional()
    .trim()
    .escape(),
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Admin note must not exceed 500 characters.')
    .escape(),
];

// ── Review Validators ─────────────────────────────────────────────────────

const reviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Title must not exceed 150 characters.')
    .escape(),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Comment must not exceed 2000 characters.')
    .escape(),
];

// ── Param Validators ──────────────────────────────────────────────────────

const uuidParam = (paramName = 'id') => [
  param(paramName)
    .isUUID().withMessage(`Invalid ${paramName} format.`),
];

const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50.'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  refreshTokenRules,
  productRules,
  productUpdateRules,
  createOrderRules,
  updateOrderStatusRules,
  reviewRules,
  uuidParam,
  paginationQuery,
};
