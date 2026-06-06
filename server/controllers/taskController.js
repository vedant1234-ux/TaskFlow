const mongoose = require('mongoose');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// Helper to check valid mongoose ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================================
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
// ============================================================
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, status, tags, assignedTo, attachments } = req.body;

  let taskUser = req.user._id;
  let assignedBy = null;

  if (req.user.role === 'admin' && assignedTo && String(assignedTo) !== String(req.user._id)) {
    taskUser = assignedTo;
    assignedBy = req.user._id;
  }

  const task = await Task.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: priority || 'medium',
    status: status || 'pending',
    dueDate: dueDate || null,
    tags: tags || [],
    attachments: attachments || [],
    user: taskUser,
    assignedBy,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully!',
    task,
  });
});

// ============================================================
// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
// ============================================================
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, sort, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (req.user.role !== 'admin') {
    filter.user = req.user._id;
  }

  if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
    filter.status = status;
  }

  if (priority && ['low', 'medium', 'high'].includes(priority)) {
    filter.priority = priority;
  }

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'priority') sortOption = { priority: -1, createdAt: -1 };
  else if (sort === 'dueDate') sortOption = { dueDate: 1 };
  else if (sort === 'title') sortOption = { title: 1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit)),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    tasks,
  });
});

// ============================================================
// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
// ============================================================
const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400);
    throw new Error('Invalid task ID format.');
  }

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (String(task.user) !== String(req.user._id) && req.user.role !== 'admin' && String(task.assignedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Access denied. You do not own this task.');
  }

  res.status(200).json({ success: true, task });
});

// ============================================================
// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
// ============================================================
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400);
    throw new Error('Invalid task ID format.');
  }

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (String(task.user) !== String(req.user._id) && req.user.role !== 'admin' && String(task.assignedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Access denied. You do not own this task.');
  }

  const allowedUpdates = [
    'title', 'description', 'status', 'priority', 'completed', 'dueDate', 'tags', 'attachments',
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  const updatedTask = await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully!',
    task: updatedTask,
  });
});

// ============================================================
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
// ============================================================
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400);
    throw new Error('Invalid task ID format.');
  }

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (String(task.user) !== String(req.user._id) && req.user.role !== 'admin' && String(task.assignedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Access denied. You do not own this task.');
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully!',
    taskId: id,
  });
});

// ============================================================
// @desc    Toggle task completion status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
// ============================================================
const toggleTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400);
    throw new Error('Invalid task ID format.');
  }

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (String(task.user) !== String(req.user._id) && req.user.role !== 'admin' && String(task.assignedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Access denied. You do not own this task.');
  }

  task.status = task.status === 'completed' ? 'pending' : 'completed';
  const updatedTask = await task.save();

  res.status(200).json({
    success: true,
    message: `Task marked as ${updatedTask.status}!`,
    task: updatedTask,
  });
});

// ============================================================
// @desc    Get task statistics for logged-in user
// @route   GET /api/tasks/stats
// @access  Private
// ============================================================
const getTaskStats = asyncHandler(async (req, res) => {
  const matchObj = {};
  if (req.user.role !== 'admin') {
    matchObj.$or = [
      { user: new mongoose.Types.ObjectId(req.user._id) },
      { assignedBy: new mongoose.Types.ObjectId(req.user._id) }
    ];
  }

  const statsPipeline = [
    { $match: matchObj },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ];

  const results = await Task.aggregate(statsPipeline);

  const stats = {
    total: 0,
    pending: 0,
    'in-progress': 0,
    completed: 0,
  };

  results.forEach((r) => {
    stats[r._id] = r.count;
    stats.total += r.count;
  });

  res.status(200).json({ success: true, stats });
});

// ============================================================
// @desc    Reply to a task
// @route   POST /api/tasks/:id/reply
// @access  Private
// ============================================================
const replyTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!isValidId(id)) {
    res.status(400);
    throw new Error('Invalid task ID format.');
  }

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required.');
  }

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  if (String(task.user) !== String(req.user._id) && req.user.role !== 'admin' && String(task.assignedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Access denied. You do not own this task.');
  }

  task.replies.push({
    message: message.trim(),
    senderId: req.user._id,
    senderName: req.user.name,
    senderAvatar: req.user.avatar,
    senderRole: req.user.role,
  });

  const updatedTask = await task.save();

  res.status(200).json({
    success: true,
    message: 'Reply added!',
    task: updatedTask,
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
  getTaskStats,
  replyTask,
};
