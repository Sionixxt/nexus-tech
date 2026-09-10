const express = require('express');
const {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  getAllUsers
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { updateOrderStatusRules, handleValidation, paginationQuery } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/orders', paginationQuery, handleValidation, getAllOrders);
router.patch('/orders/:id/status', updateOrderStatusRules, handleValidation, updateOrderStatus);
router.get('/products', paginationQuery, handleValidation, getAllProducts);
router.get('/users', paginationQuery, handleValidation, getAllUsers);

module.exports = router;
