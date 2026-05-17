const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
      maxlength: [120, 'Product title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Please provide the original price'],
      min: [0, 'Price must be a positive number'],
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Please provide the discounted price'],
      min: [0, 'Discounted price must be a positive number'],
      validate: {
        validator: function (value) {
          
          return value <= this.originalPrice;
        },
        message: 'Discounted price ({VALUE}) must be less than or equal to the original price',
      },
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category for the product'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
