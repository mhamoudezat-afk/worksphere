const taskService = require('../services/task.service');
const { AppError } = require('../middleware/errorHandler');

const getTasks = async (req, res, next) => {
  try {
    const { page, limit, status, priority, projectId } = req.query;
    const result = await taskService.getAllTasks(req.user.id, {
      page,
      limit,
      status,
      priority,
      projectId
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    res.json(task);
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(
      req.body,
      req.user.id,
      req.user.name
    );
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    res.json(task);
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json(task);
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const stats = await taskService.getTaskStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskStats
};