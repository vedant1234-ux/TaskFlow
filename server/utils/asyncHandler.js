/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors without try/catch in every controller
 */

/**
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware that catches async errors
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
