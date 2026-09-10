const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  getProduct, 
  getFeaturedProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/product.controller');

const { authenticate, authorize } = require('../middleware/auth');
const { 
  productRules, 
  productUpdateRules, 
  handleValidation, 
  uuidParam, 
  paginationQuery 
} = require('../middleware/validate');

router.get('/', paginationQuery, handleValidation, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProduct);

router.post(
  '/', 
  authenticate, 
  authorize('ADMIN'), 
  productRules, 
  handleValidation, 
  createProduct
);

router.put(
  '/:id', 
  authenticate, 
  authorize('ADMIN'), 
  uuidParam('id'), 
  productUpdateRules, 
  handleValidation, 
  updateProduct
);

router.delete(
  '/:id', 
  authenticate, 
  authorize('ADMIN'), 
  uuidParam('id'), 
  handleValidation, 
  deleteProduct
);

module.exports = router;
