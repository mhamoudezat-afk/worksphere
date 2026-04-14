const Activity = require('../models/Activity');

// إنشاء نشاط جديد
const createActivity = async (userId, userName, action, targetType, targetId, targetName, details = {}) => {
  const activity = await Activity.create({
    user: userId,
    userName,
    action,
    targetType,
    targetId,
    targetName,
    details
  });
  
  return activity;
};

// جلب الأنشطة
const getActivities = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Activity.countDocuments();
    
    res.json({
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب أنشطة مشروع معين
const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const activities = await Activity.find({
      $or: [
        { targetId: projectId },
        { 'details.projectId': projectId }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getProjectActivities
};