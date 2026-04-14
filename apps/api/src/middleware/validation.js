const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const validateProject = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  validate,
];

const validateTask = [
  body('title').notEmpty().withMessage('Task title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('project').notEmpty().withMessage('Project ID is required'),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateTask,
};