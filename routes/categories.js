
// routes/categories.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, requireAdmin } = require('../middleware/auth');

// Public: get categories
router.get('/', categoryController.getCategories);

// Protected: create category (admin)
router.post(
  '/',
  auth,
  requireAdmin,
  [body('name').isLength({ min: 2 }).withMessage('name min 2 chars')],
  categoryController.createCategory
);

module.exports = router;
