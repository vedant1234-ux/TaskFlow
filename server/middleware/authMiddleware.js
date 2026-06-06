/**
 * Auth Middleware
 * Verifies JWT token and attaches user to request
 */

const User = require('../models/User');
const { verifyToken } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes - Requires valid JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Token not provided
  if (!token) {
    res.status(401);
    throw new Error('Access denied. No token provided.');
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired. Please login again.');
    }
    throw new Error('Invalid token. Please login again.');
  }

  // Find user from token payload
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('User not found. Please login again.');
  }

  // Attach user to request object
  req.user = user;
  next();
});

/**
 * Admin only middleware
 * Must be used after protect middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Admin privileges required.');
  }
};

module.exports = { protect, adminOnly };
