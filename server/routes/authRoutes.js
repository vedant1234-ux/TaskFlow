/**
 * Auth Routes
 * Handles user authentication endpoints
 */

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validateMiddleware');

// Public Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected Routes (require valid JWT)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
