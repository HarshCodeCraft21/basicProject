const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendSuccess } = require('../utils/responseHandler');


const addProduct = asyncHandler(async (req, res) => {
  const { title, description, originalPrice, discountedPrice, category } = req.body;

  if (!title || !description || !originalPrice || !discountedPrice || !category) {
    
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(400);
    throw new Error('Please fill in all product fields (title, description, originalPrice, discountedPrice, category)');
  }

  
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(400);
    throw new Error('Referenced category does not exist');
  }

  let imageUrl = undefined;

  
  if (req.file) {
    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'sandy_ecommerce',
        });
        imageUrl = result.secure_url;
        
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('[Cloudinary Upload Error]:', error);
        
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      
      imageUrl = `/uploads/${req.file.filename}`;
      console.log(`[Local Disk Upload]: Saved file locally as ${imageUrl}`);
    }
  }

  
  const product = await Product.create({
    title,
    description,
    originalPrice: Number(originalPrice),
    discountedPrice: Number(discountedPrice),
    category,
    ...(imageUrl && { image: imageUrl }), 
  });

  const populatedProduct = await Product.findById(product._id).populate('category');

  sendSuccess(res, 'Product created successfully', populatedProduct, 201);
});


const getProducts = asyncHandler(async (req, res) => {
  
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 8;
  const search = req.query.search || '';
  const categoryId = req.query.category || '';
  const sort = req.query.sort || 'latest';

  
  const filter = {};

  
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  
  if (categoryId) {
    filter.category = categoryId;
  }

  
  const count = await Product.countDocuments(filter);

  
  let sortOption = {};
  if (sort === 'price_asc') {
    sortOption = { discountedPrice: 1 };
  } else if (sort === 'price_desc') {
    sortOption = { discountedPrice: -1 };
  } else {
    
    sortOption = { createdAt: -1 };
  }

  
  const products = await Product.find(filter)
    .populate('category')
    .sort(sortOption)
    .limit(limit)
    .skip(limit * (page - 1));

  sendSuccess(res, 'Products fetched successfully', {
    products,
    page,
    pages: Math.ceil(count / limit) || 1,
    totalProducts: count,
  });
});


const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  sendSuccess(res, 'Product details fetched successfully', product);
});


const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, originalPrice, discountedPrice, category } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(404);
    throw new Error('Product not found');
  }

  
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      res.status(400);
      throw new Error('Referenced category does not exist');
    }
    product.category = category;
  }

  
  if (req.file) {
    let imageUrl = undefined;
    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'sandy_ecommerce',
        });
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('[Cloudinary Upload Error]:', error);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    product.image = imageUrl;
  }

  
  if (title) product.title = title;
  if (description) product.description = description;
  if (originalPrice) product.originalPrice = Number(originalPrice);
  if (discountedPrice) product.discountedPrice = Number(discountedPrice);

  const updatedProduct = await product.save();
  const populatedProduct = await Product.findById(updatedProduct._id).populate('category');

  sendSuccess(res, 'Product updated successfully', populatedProduct);
});


const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await Product.deleteOne({ _id: req.params.id });

  sendSuccess(res, 'Product deleted successfully');
});

module.exports = {
  addProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
