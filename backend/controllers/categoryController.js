const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { sendSuccess } = require('../utils/responseHandler');


const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('A category with this name already exists');
  }

  const category = await Category.create({ name });

  sendSuccess(res, 'Category created successfully', category, 201);
});


const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  sendSuccess(res, 'Categories retrieved successfully', categories);
});


const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  
  const nameTaken = await Category.findOne({ name, _id: { $ne: req.params.id } });
  if (nameTaken) {
    res.status(400);
    throw new Error('Another category with this name already exists');
  }

  category.name = name;
  const updatedCategory = await category.save();

  sendSuccess(res, 'Category updated successfully', updatedCategory);
});


const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  
  await Category.deleteOne({ _id: req.params.id });

  
  await Product.updateMany({ category: req.params.id }, { $unset: { category: 1 } });

  sendSuccess(res, 'Category deleted successfully and associated products unlinked');
});

module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
