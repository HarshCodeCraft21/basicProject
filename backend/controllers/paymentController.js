const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendSuccess } = require('../utils/responseHandler');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Initialize Razorpay client with credentials from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create Razorpay Order and save pending order in DB
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { products, totalAmount } = req.body;

  // 1. Validate request body
  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('Invalid purchase request. Your cart is empty.');
  }

  // 2. Fetch the latest user records to snap shipping snapshot
  const userRecord = await User.findById(req.user._id);
  if (!userRecord || !userRecord.address || !userRecord.phone) {
    res.status(400);
    throw new Error('Shipping profile incomplete. Please complete your address and phone number details.');
  }

  let calculatedSubtotal = 0;
  const validatedProducts = [];

  // 3. Validate products and calculate secure total from database prices
  for (const item of products) {
    const productRecord = await Product.findById(item.product);
    if (!productRecord) {
      res.status(404);
      throw new Error(`Product not found in our catalogs.`);
    }

    const purchasePrice = productRecord.discountedPrice;
    calculatedSubtotal += purchasePrice * item.quantity;

    validatedProducts.push({
      product: productRecord._id,
      quantity: item.quantity,
      price: purchasePrice,
    });
  }

  // Calculate shipping fee matching frontend logic (Free above Rs.1500, else Rs.150)
  const shippingFee = calculatedSubtotal >= 1500 || calculatedSubtotal === 0 ? 0 : 150;
  const finalCalculatedTotal = calculatedSubtotal + shippingFee;

  // 4. Prevent price tampering - check with tolerance for float precision
  if (Math.abs(finalCalculatedTotal - totalAmount) > 1) {
    res.status(400);
    throw new Error('Checkout validation error: Pricing mismatch detected.');
  }

  // 5. Create Razorpay order options
  const amountInPaise = Math.round(finalCalculatedTotal * 100); // Razorpay expects amount in paise
  const receiptId = `receipt_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const razorpayOptions = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
  };

  try {
    // 6. Generate order in Razorpay
    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    if (!razorpayOrder) {
      res.status(500);
      throw new Error('Could not establish connection with Razorpay payment gateway.');
    }

    const totalQty = validatedProducts.reduce((sum, item) => sum + item.quantity, 0);

    // 7. Save a pending order in MongoDB containing static shipping snapshot
    const pendingOrder = await Order.create({
      user: req.user._id,
      products: validatedProducts,
      totalAmount: finalCalculatedTotal,
      shippingFee,
      orderId: razorpayOrder.id,
      paymentStatus: 'pending',
      shippingAddress: userRecord.address,
      shippingPhone: userRecord.phone,
      orderStatus: 'Order Received',
      quantity: totalQty,
    });

    // 8. Return required parameters to frontend
    sendSuccess(
      res,
      'Razorpay order created successfully',
      {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
      201
    );

  } catch (error) {
    res.status(500);
    throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
  }
});

/**
 * @desc    Verify Razorpay payment signature & update order status
 * @route   POST /api/payments/verify-payment
 * @access  Private
 */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Payment confirmation payload missing crucial elements.');
  }

  // 1. Generate local SHA256 HMAC signature
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  // 2. Locate order in DB
  const orderRecord = await Order.findOne({ orderId: razorpay_order_id });
  if (!orderRecord) {
    res.status(404);
    throw new Error(`Receipt Order Record not found in our database: ${razorpay_order_id}`);
  }

  // 3. Authenticate signature
  if (generatedSignature === razorpay_signature) {
    // Transaction successful
    orderRecord.paymentId = razorpay_payment_id;
    orderRecord.signature = razorpay_signature;
    orderRecord.paymentStatus = 'paid';
    orderRecord.orderStatus = 'Order Received';
    await orderRecord.save();

    // Populate user and products inside the success response for receipt visualization
    const populatedOrder = await Order.findById(orderRecord._id)
      .populate('user', 'name email address phone')
      .populate('products.product', 'title image description');

    // 4. Trigger Nodemailer Customer Order Email blast asynchronously
    sendOrderConfirmationEmail(populatedOrder).catch((err) => {
      console.error('[VerifySecurePayment]: Nodemailer transaction confirmation failed to dispatch:', err.message);
    });

    sendSuccess(res, 'Payment verified successfully and order finalized.', populatedOrder);
  } else {
    // Verification Mismatch
    orderRecord.paymentStatus = 'failed';
    await orderRecord.save();

    res.status(400);
    throw new Error('Cryptographic signature mismatch. Payment authentication failed.');
  }
});

/**
 * @desc    Get current user's order history
 * @route   GET /api/payments/my-orders
 * @access  Private
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('products.product', 'title image discountedPrice originalPrice')
    .sort({ createdAt: -1 });

  sendSuccess(res, 'User orders fetched successfully', orders);
});

/**
 * @desc    Get detailed order specifications by database ID
 * @route   GET /api/payments/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('products.product', 'title image discountedPrice originalPrice description');

  if (!order) {
    res.status(404);
    throw new Error('Order transaction record not found.');
  }

  // Authorize: check if user is the buyer or is an admin
  const isBuyer = order.user?._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    res.status(403);
    throw new Error('Access denied. You are not authorized to view this transaction ledger.');
  }

  sendSuccess(res, 'Order details fetched successfully', order);
});

/**
 * @desc    Update order status parameters
 * @route   PUT /api/payments/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  if (!orderStatus) {
    res.status(400);
    throw new Error('Status configuration parameter missing in request body.');
  }

  const validStatuses = ['Order Received', 'Packed', 'Dispatched', 'Delivered'];
  if (!validStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error('Invalid order status configuration requested.');
  }

  const orderRecord = await Order.findById(req.params.id);

  if (!orderRecord) {
    res.status(404);
    throw new Error('Order transaction record not found.');
  }

  orderRecord.orderStatus = orderStatus;
  await orderRecord.save();

  // Populate user and product metadata for visual confirmation
  const populatedOrder = await Order.findById(orderRecord._id)
    .populate('user', 'name email phone address')
    .populate('products.product', 'title image discountedPrice originalPrice');

  // Retrieve Socket.io instance and broadcast real-time update
  const io = req.app.get('socketio');
  if (io) {
    io.emit('orderStatusUpdated', populatedOrder);
    console.log(`[Socket.io Server]: Broadcasted order status update for ${populatedOrder.orderId} to all clients.`);
  }

  sendSuccess(res, `Order status updated to "${orderStatus}" successfully.`, populatedOrder);
});

/**
 * @desc    Get all orders for admin dashboard
 * @route   GET /api/payments/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email phone address')
    .populate('products.product', 'title image originalPrice discountedPrice')
    .sort({ createdAt: -1 });

  sendSuccess(res, 'Orders fetched successfully', orders);
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};
