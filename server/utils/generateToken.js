/**
 * JWT Token Generator Utility
 * Creates signed JWT tokens for authentication
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {string} id - User's MongoDB _id
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    {
      id,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'taskflow-api',
      audience: 'taskflow-client',
    }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'taskflow-api',
    audience: 'taskflow-client',
  });
};

module.exports = { generateToken, verifyToken };
