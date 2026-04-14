const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { validate, createTaskSchema, updateTaskSchema, updateStatusSchema } = require('../validators/task.validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/task.controller');

// Apply rate limiting to all task routes
router.use(protect);
router.use(apiLimiter);

router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id/status', validate(updateStatusSchema), updateTaskStatus);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

module.exports = router;