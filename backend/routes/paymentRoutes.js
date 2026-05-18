const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createRazorpayOrder);

router.post('/verify-payment', protect, verifyRazorpayPayment);

router.get('/my-orders', protect, getUserOrders);

router.get('/orders/:id', protect, getOrderById);

router.put('/orders/:id/status', protect, admin, updateOrderStatus);

router.get('/orders', protect, admin, getAllOrders);

module.exports = router;
