const express = require('express');
const { createReview, getProductReviews, deleteReview } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');
const { reviewRules, handleValidation, uuidParam, paginationQuery } = require('../middleware/validate');

const router = express.Router();

router.post('/products/:productId', authenticate, uuidParam('productId'), reviewRules, handleValidation, createReview);
router.get('/products/:productId', uuidParam('productId'), paginationQuery, handleValidation, getProductReviews);
router.delete('/:id', authenticate, uuidParam('id'), handleValidation, deleteReview);

module.exports = router;
