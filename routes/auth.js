// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Register
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('username must be at least 3 chars'),
    body('email').isEmail().withMessage('valid email required'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 chars'),
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('valid email required'),
    body('password').exists().withMessage('password required'),
  ],
  authController.login
);

// Get current user
router.get('/me', auth, authController.me);

module.exports = router;
