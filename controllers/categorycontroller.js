// controllers/categoryController.js
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name, slug });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};
