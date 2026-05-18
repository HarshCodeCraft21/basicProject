const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, getAllOrders } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Secure route: Create a new Razorpay checkout order (requires user authentication)
router.post('/create-order', protect, createRazorpayOrder);

// Secure route: Cryptographically verify a successful payment signature (requires user authentication)
router.post('/verify-payment', protect, verifyRazorpayPayment);

// Secure route: Get all customer orders for the admin dashboard (requires admin authentication)
router.get('/orders', protect, admin, getAllOrders);

module.exports = router;
