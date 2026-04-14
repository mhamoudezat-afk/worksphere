const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  projectId: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done').default('todo'),
  cost: Joi.number().min(0).default(0),
  estimatedHours: Joi.number().min(0).default(0),
  dueDate: Joi.date().optional(),
  labels: Joi.array().items(Joi.string()).optional(),
  assigneeId: Joi.string().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done').optional(),
  cost: Joi.number().min(0).optional(),
  estimatedHours: Joi.number().min(0).optional(),
  dueDate: Joi.date().optional(),
  labels: Joi.array().items(Joi.string()).optional(),
  assigneeId: Joi.string().optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done').required(),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  validate
};