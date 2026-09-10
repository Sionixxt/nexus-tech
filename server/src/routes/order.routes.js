const express = require('express');
const { createOrder, getOrders, getOrder, cancelOrder } = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { createOrderRules, handleValidation, uuidParam, paginationQuery } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.post('/', createOrderRules, handleValidation, createOrder);
router.get('/', paginationQuery, handleValidation, getOrders);
router.get('/:id', uuidParam('id'), handleValidation, getOrder);
router.patch('/:id/cancel', uuidParam('id'), handleValidation, cancelOrder);

module.exports = router;
