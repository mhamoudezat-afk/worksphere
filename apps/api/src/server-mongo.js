const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ============ MongoDB Connection ==========
const MONGODB_URI = 'mongodb://localhost:27017/worksphere';

// إعدادات mongoose للإصدارات الجديدة
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB Connected successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB Connection error:', err.message);
  console.log('⚠️ Please make sure MongoDB is running:');
  console.log('   1. Open PowerShell as Administrator');
  console.log('   2. Run: net start MongoDB');
  console.log('   3. Or: "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe" --dbpath="C:\\data\\db"');
});

// ============ Models ============

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Project Model
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

// Task Model
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
  description: { type: String, default: '' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  cost: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  dueDate: Date,
  labels: [String],
  subtasks: [subtaskSchema],
  comments: [commentSchema],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    uploadedAt: Date
  }],
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Task = mongoose.model('Task', taskSchema);

// Activity Model
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  targetName: String,
  details: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

activitySchema.index({ createdAt: -1 });
const Activity = mongoose.model('Activity', activitySchema);

// Notification Model
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
const Notification = mongoose.model('Notification', notificationSchema);

// Subscription Model
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'canceled', 'expired'], default: 'active' },
  features: {
    maxProjects: { type: Number, default: 3 },
    maxTeamMembers: { type: Number, default: 5 },
    maxStorage: { type: Number, default: 100 },
    customFields: { type: Boolean, default: false },
    advancedReports: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ============ Company Budget ==========
let companyBudget = {
  total: 100000,
  currency: 'EGP',
  updatedAt: new Date()
};

// ============ Middleware ==========
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'غير مصرح، لا يوجد توكن' });
  }
  
  try {
    const decoded = jwt.verify(token, 'worksphere_secret_key_2024');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح، تحتاج صلاحيات مدير' });
  }
  next();
};

// Helper Functions
const createActivity = async (userId, userName, action, targetType, targetId, targetName, details = {}) => {
  try {
    await Activity.create({
      userId,
      userName,
      action,
      targetType,
      targetId,
      targetName,
      details
    });
  } catch (error) {
    console.error('Failed to create activity:', error);
  }
};

const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    await Notification.create({ userId, type, title, message, data });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// ============ Auth Routes ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني موجود بالفعل' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member'
    });
    
    // Create subscription for user
    await Subscription.create({
      userId: user._id,
      plan: 'free',
      features: {
        maxProjects: 3,
        maxTeamMembers: 5,
        maxStorage: 100,
        customFields: false,
        advancedReports: false,
        prioritySupport: false
      }
    });
    
    const token = jwt.sign({ id: user._id }, 'worksphere_secret_key_2024', { expiresIn: '30d' });
    
    await createActivity(user._id, user.name, 'user_joined', 'user', user._id, user.name);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign({ id: user._id }, 'worksphere_secret_key_2024', { expiresIn: '30d' });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json(req.user);
});

// ============ User Routes ==========
app.get('/api/users', protect, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

app.get('/api/users/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
  res.json(user);
});

app.put('/api/users/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
  
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'لا يمكنك تعديل مستخدم آخر' });
  }
  
  user.name = req.body.name || user.name;
  if (req.user.role === 'admin' && req.body.role) user.role = req.body.role;
  await user.save();
  
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

app.delete('/api/users/:id', protect, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
  
  if (user.email === 'ahmed@test.com') {
    return res.status(403).json({ message: 'لا يمكن حذف المدير الرئيسي' });
  }
  
  await User.findByIdAndDelete(req.params.id);
  await Project.deleteMany({ userId: req.params.id });
  await Task.deleteMany({ userId: req.params.id });
  await Subscription.deleteMany({ userId: req.params.id });
  
  res.json({ message: 'تم حذف المستخدم بنجاح' });
});

// ============ Subscription Routes ==========
app.get('/api/subscription', protect, async (req, res) => {
  let subscription = await Subscription.findOne({ userId: req.user._id });
  
  if (!subscription) {
    subscription = await Subscription.create({
      userId: req.user._id,
      plan: 'free',
      features: {
        maxProjects: 3,
        maxTeamMembers: 5,
        maxStorage: 100,
        customFields: false,
        advancedReports: false,
        prioritySupport: false
      }
    });
  }
  
  const projectsCount = await Project.countDocuments({ userId: req.user._id });
  const teamMembersCount = await User.countDocuments();
  
  res.json({
    ...subscription.toObject(),
    usage: {
      projects: projectsCount,
      teamMembers: teamMembersCount,
      projectsRemaining: Math.max(0, subscription.features.maxProjects - projectsCount),
      teamMembersRemaining: Math.max(0, subscription.features.maxTeamMembers - teamMembersCount)
    }
  });
});

app.put('/api/subscription/upgrade', protect, async (req, res) => {
  const { plan } = req.body;
  
  const plans = {
    pro: {
      maxProjects: 50,
      maxTeamMembers: 20,
      maxStorage: 5000,
      customFields: true,
      advancedReports: true,
      prioritySupport: false
    },
    enterprise: {
      maxProjects: 999,
      maxTeamMembers: 999,
      maxStorage: 50000,
      customFields: true,
      advancedReports: true,
      prioritySupport: true
    }
  };
  
  if (!plans[plan]) {
    return res.status(400).json({ message: 'Invalid plan' });
  }
  
  const subscription = await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    { plan, features: plans[plan], startDate: new Date() },
    { new: true }
  );
  
  await createNotification(req.user._id, 'subscription', 'ترقية الخطة', `تم ترقية حسابك إلى خطة ${plan}`);
  
  res.json({ message: `Upgraded to ${plan}`, subscription });
});

// ============ Project Routes ==========
app.get('/api/projects', protect, async (req, res) => {
  const projects = await Project.find({ userId: req.user._id })
    .populate('members', 'name email')
    .sort({ createdAt: -1 });
  res.json(projects);
});

app.get('/api/projects/:id', protect, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('members', 'name email');
  if (!project) return res.status(404).json({ message: 'المشروع غير موجود' });
  res.json(project);
});

app.post('/api/projects', protect, async (req, res) => {
  const { name, description, priority, budget, startDate, endDate, members } = req.body;
  
  // Check budget
  const allProjects = await Project.find();
  const currentSpent = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  
  if (currentSpent + (budget || 0) > companyBudget.total) {
    return res.status(400).json({ 
      message: `الميزانية غير كافية. المتبقي: ${(companyBudget.total - currentSpent).toLocaleString()} ج.م`
    });
  }
  
  const project = await Project.create({
    name,
    description: description || '',
    priority: priority || 'medium',
    budget: budget || 0,
    startDate: startDate || null,
    endDate: endDate || null,
    members: members || [],
    userId: req.user._id
  });
  
  await createActivity(req.user._id, req.user.name, 'created_project', 'project', project._id, name);
  await createNotification(req.user._id, 'project', 'مشروع جديد', `تم إنشاء مشروع جديد: ${name}`);
  
  const populatedProject = await Project.findById(project._id).populate('members', 'name email');
  res.status(201).json(populatedProject);
});

app.put('/api/projects/:id', protect, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  ).populate('members', 'name email');
  
  if (!project) return res.status(404).json({ message: 'المشروع غير موجود' });
  res.json(project);
});

app.delete('/api/projects/:id', protect, async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!project) return res.status(404).json({ message: 'المشروع غير موجود' });
  
  await Task.deleteMany({ projectId: req.params.id });
  res.json({ message: 'تم حذف المشروع بنجاح' });
});

// ============ Task Routes ==========
app.get('/api/tasks', protect, async (req, res) => {
  const { projectId, status } = req.query;
  const query = { userId: req.user._id };
  if (projectId) query.projectId = projectId;
  if (status) query.status = status;
  
  const tasks = await Task.find(query)
    .populate('projectId', 'name')
    .populate('assigneeId', 'name')
    .sort({ createdAt: -1 });
  res.json(tasks);
});

app.get('/api/tasks/:id', protect, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('projectId', 'name')
    .populate('assigneeId', 'name')
    .populate('comments.userId', 'name');
  
  if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
  res.json(task);
});

app.post('/api/tasks', protect, async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.user._id
  });
  
  await createActivity(req.user._id, req.user.name, 'created_task', 'task', task._id, task.title);
  await createNotification(req.user._id, 'task', 'مهمة جديدة', `تم إنشاء مهمة جديدة: ${task.title}`);
  
  if (req.body.assigneeId && req.body.assigneeId !== req.user._id) {
    await createNotification(req.body.assigneeId, 'task_assigned', 'مهمة جديدة', `${req.user.name} عينك في مهمة: ${task.title}`);
  }
  
  const populatedTask = await Task.findById(task._id).populate('projectId', 'name');
  res.status(201).json(populatedTask);
});

app.put('/api/tasks/:id/status', protect, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status: req.body.status, updatedAt: Date.now() },
    { new: true }
  );
  
  if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  if (req.body.status === 'done') {
    await createActivity(req.user._id, req.user.name, 'completed_task', 'task', task._id, task.title);
  }
  
  res.json(task);
});

app.put('/api/tasks/:id', protect, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { ...req.body, updatedAt: Date.now() },
    { new: true }
  );
  
  if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
  res.json(task);
});

app.delete('/api/tasks/:id', protect, async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
  res.json({ message: 'تم حذف المهمة بنجاح' });
});

app.post('/api/tasks/:id/comments', protect, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  task.comments.push({
    userId: req.user._id,
    userName: req.user.name,
    content: req.body.content
  });
  await task.save();
  
  await createActivity(req.user._id, req.user.name, 'commented_task', 'comment', task._id, task.title, { comment: req.body.content });
  
  res.json(task);
});

// ============ Company Budget Routes ==========
app.get('/api/company/budget', protect, async (req, res) => {
  const projects = await Project.find();
  const totalSpent = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  
  res.json({
    totalBudget: companyBudget.total,
    spentBudget: totalSpent,
    remainingBudget: companyBudget.total - totalSpent,
    projectsCount: projects.length,
    currency: companyBudget.currency
  });
});

app.put('/api/company/budget', protect, adminOnly, async (req, res) => {
  const { totalBudget } = req.body;
  if (totalBudget && totalBudget > 0) {
    companyBudget.total = totalBudget;
    companyBudget.updatedAt = new Date();
  }
  res.json({ message: 'تم تحديث الميزانية بنجاح', budget: companyBudget });
});

// ============ Dashboard Routes ==========
app.get('/api/dashboard/kpis', protect, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  const projects = await Project.find({ userId: req.user._id });
  const completed = tasks.filter(t => t.status === 'done').length;
  
  res.json({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: completed,
    overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    activeTeamMembers: await User.countDocuments()
  });
});

app.get('/api/dashboard/insights', protect, async (req, res) => {
  const projects = await Project.find({ userId: req.user._id });
  const tasks = await Task.find({ userId: req.user._id });
  
  const behindSchedule = projects
    .filter(p => p.endDate && new Date(p.endDate) < new Date())
    .map(p => ({ projectName: p.name, daysLate: Math.floor((new Date().getTime() - new Date(p.endDate).getTime()) / (1000 * 3600 * 24)) }));
  
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const urgentTasks = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) <= threeDaysFromNow && t.status !== 'done')
    .map(t => ({ title: t.title, dueDate: t.dueDate }));
  
  res.json({ behindSchedule, urgentTasks, topPerformers: [] });
});

app.get('/api/dashboard/charts', protect, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weeklyData = days.map(day => ({ day, created: 0, completed: 0 }));
  
  tasks.forEach(task => {
    const createdDay = new Date(task.createdAt).getDay();
    weeklyData[createdDay].created++;
    if (task.status === 'done' && task.updatedAt) {
      const completedDay = new Date(task.updatedAt).getDay();
      weeklyData[completedDay].completed++;
    }
  });
  
  const priorityData = [
    { name: 'urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    { name: 'high', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'low', value: tasks.filter(t => t.priority === 'low').length }
  ];
  
  res.json({ weeklyData, priorityData, productivityData: [] });
});

app.get('/api/dashboard/team-performance', protect, async (req, res) => {
  const users = await User.find();
  const teamPerformance = await Promise.all(users.map(async (user) => {
    const tasks = await Task.find({ userId: user._id });
    const completed = tasks.filter(t => t.status === 'done').length;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      totalTasks: tasks.length,
      completedTasks: completed,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0
    };
  }));
  
  res.json(teamPerformance);
});

// ============ Activity Routes ==========
app.get('/api/activities', protect, async (req, res) => {
  const activities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ activities });
});

// ============ Notification Routes ==========
app.get('/api/notifications', protect, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
  
  res.json({ notifications, unreadCount });
});

app.put('/api/notifications/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'تم تحديث الإشعار' });
});

app.put('/api/notifications/read-all', protect, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: 'تم تحديث جميع الإشعارات' });
});

// ============ Health Check ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server running with MongoDB',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    stats: {
      users: 0,
      projects: 0,
      tasks: 0
    }
  });
});

// ============ Create Default Admin User ==========
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'ahmed@test.com' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        password: '123456',
        role: 'admin'
      });
      
      await Subscription.create({
        userId: admin._id,
        plan: 'free',
        features: {
          maxProjects: 3,
          maxTeamMembers: 5,
          maxStorage: 100,
          customFields: false,
          advancedReports: false,
          prioritySupport: false
        }
      });
      
      console.log('✅ Default admin user created: ahmed@test.com / 123456');
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
};

// ============ Start Server ==========
const PORT = 5001;

const server = app.listen(PORT, async () => {
  console.log('\n========================================');
  console.log('🚀 WorkSphere Server with MongoDB');
  console.log('========================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
  console.log(`📁 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`✅ Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`💰 Budget: http://localhost:${PORT}/api/company/budget`);
  console.log('========================================\n');
  
  await createDefaultAdmin();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`\n⚠️ Port ${PORT} is already in use!`);
    console.log('Please close the other server and try again.\n');
  } else {
    console.error('Server error:', error);
  }
});