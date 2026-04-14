const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userAvatar: String,
  action: {
    type: String,
    enum: [
      'created_task',
      'updated_task',
      'completed_task',
      'deleted_task',
      'commented_task',
      'created_project',
      'updated_project',
      'added_member',
      'removed_member'
    ],
    required: true
  },
  targetType: {
    type: String,
    enum: ['task', 'project', 'comment', 'member'],
    required: true
  },
  targetId: { type: String, required: true },
  targetName: { type: String },
  details: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1 });

module.exports = mongoose.model('Activity', activitySchema);