/**
 * Auth Controller
 * Handles user registration, login, profile, and logout
 */

const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// ============================================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ============================================================
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name.trim()
    )}&background=4F46E5&color=ffffff&size=200&bold=true&format=png`,
  });

  if (!user) {
    res.status(500);
    throw new Error('Failed to create account. Please try again.');
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// ============================================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  // Verify password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful!',
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// ============================================================
// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
// ============================================================
const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by authMiddleware
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.status(200).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// ============================================================
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ============================================================
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Update fields if provided
  if (name) user.name = name.trim();
  if (avatar) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// ============================================================
// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
// ============================================================
const logout = asyncHandler(async (req, res) => {
  // JWT is stateless; actual logout happens on the client by removing token
  // Server-side: could maintain a token blacklist in Redis for production
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = { register, login, getProfile, updateProfile, logout };
