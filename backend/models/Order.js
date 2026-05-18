const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An order must belong to a user'],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'An order item must reference a product'],
        },
        quantity: {
          type: Number,
          required: [true, 'An order item must have a quantity'],
          min: [1, 'Quantity cannot be less than 1'],
        },
        price: {
          type: Number,
          required: [true, 'An order item must have a purchase price'],
          min: [0, 'Price must be a positive number'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'An order must have a total amount'],
      min: [0, 'Total amount must be a positive number'],
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      trim: true,
      default: '',
    },
    orderId: {
      type: String,
      required: [true, 'An order must have a associated Razorpay Order ID'],
      trim: true,
    },
    signature: {
      type: String,
      trim: true,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    shippingAddress: {
      type: String,
      required: [true, 'An order must have a shipping address'],
      trim: true,
    },
    shippingPhone: {
      type: String,
      required: [true, 'An order must have a shipping phone number'],
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'Packed', 'Dispatched', 'Delivered'],
      default: 'Order Received',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
