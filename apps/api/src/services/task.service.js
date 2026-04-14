const Task = require('../models/Task');
const { createActivity } = require('./activity.service');
const { createNotification } = require('./notification.service');

class TaskService {
  async getAllTasks(userId, filters = {}) {
    const query = { userId };
    
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.projectId) query.projectId = filters.projectId;
    
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('projectId', 'name')
        .populate('assigneeId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query)
    ]);
    
    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getTaskById(id, userId) {
    const task = await Task.findOne({ _id: id, userId })
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email');
    
    if (!task) throw new Error('Task not found');
    return task;
  }
  
  async createTask(data, userId, userName) {
    const task = await Task.create({
      ...data,
      userId
    });
    
    await createActivity(userId, userName, 'created_task', 'task', task._id, task.title);
    
    if (data.assigneeId && data.assigneeId !== userId) {
      await createNotification(data.assigneeId, 'task_assigned', 'مهمة جديدة', `${userName} عينك في مهمة: ${task.title}`);
    }
    
    return task;
  }
  
  async updateTaskStatus(id, userId, status) {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!task) throw new Error('Task not found');
    return task;
  }
  
  async updateTask(id, userId, updates) {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!task) throw new Error('Task not found');
    return task;
  }
  
  async deleteTask(id, userId) {
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) throw new Error('Task not found');
    return task;
  }
  
  async getTaskStats(userId) {
    const tasks = await Task.find({ userId });
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
    
    return { total, completed, inProgress, todo, overdue, byPriority };
  }
}

module.exports = new TaskService();