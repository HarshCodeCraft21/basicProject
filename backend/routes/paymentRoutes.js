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

// Secure route: Create a new Razorpay checkout order (requires user authentication)
router.post('/create-order', protect, createRazorpayOrder);

// Secure route: Cryptographically verify a successful payment signature (requires user authentication)
router.post('/verify-payment', protect, verifyRazorpayPayment);

// Secure route: Fetch current authenticated user's personal orders list
router.get('/my-orders', protect, getUserOrders);

// Secure route: Fetch specific order details (requires owner or admin privileges)
router.get('/orders/:id', protect, getOrderById);

// Secure route: Update order status (requires admin privileges)
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

// Secure route: Get all customer orders for the admin dashboard (requires admin authentication)
router.get('/orders', protect, admin, getAllOrders);

module.exports = router;
