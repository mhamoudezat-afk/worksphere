const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'trial'],
    default: 'active'
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  features: {
    maxProjects: { type: Number, default: 3 },
    maxTeamMembers: { type: Number, default: 5 },
    maxStorage: { type: Number, default: 100 }, // MB
    customFields: { type: Boolean, default: false },
    advancedReports: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);