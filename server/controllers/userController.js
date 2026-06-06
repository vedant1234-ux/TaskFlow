/**
 * User Controller
 * Admin operations for users
 */

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// ============================================================
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
// ============================================================
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

module.exports = { getUsers };
