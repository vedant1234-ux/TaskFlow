/**
 * Task Routes
 * All routes are protected — require valid JWT
 */

const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
  getTaskStats,
  replyTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validateMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Stats route (must be before /:id to avoid conflicts)
router.get('/stats', getTaskStats);

// Base task routes
router.route('/').get(getTasks).post(validateTask, createTask);

// Single task routes
router.route('/:id').get(getTask).put(validateTask, updateTask).delete(deleteTask);

// Toggle completion
router.patch('/:id/toggle', toggleTask);

// Reply to task
router.post('/:id/reply', replyTask);

module.exports = router;
