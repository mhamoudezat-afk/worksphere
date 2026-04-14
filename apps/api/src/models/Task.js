const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false }
});

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ربط بالمستخدم
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  cost: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  dueDate: Date,
  labels: [String],
  subtasks: [subtaskSchema],
  comments: [commentSchema],
  attachments: [{
    name: String,
    url: String,
    size: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);