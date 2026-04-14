const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============ قاعدة بيانات في الذاكرة ============
let users = [];
let projects = [];
let tasks = [];
let notifications = [];
let activities = [];
let subscriptions = [];
let nextId = {
  user: 1,
  project: 1,
  task: 1,
  notification: 1,
  activity: 1,
  subscription: 1,
};

// ============ خطط الاشتراك ============
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      maxProjects: 3,
      maxTeamMembers: 5,
      maxStorage: 100,
      customFields: false,
      advancedReports: false,
      prioritySupport: false
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: {
      maxProjects: 50,
      maxTeamMembers: 20,
      maxStorage: 5000,
      customFields: true,
      advancedReports: true,
      prioritySupport: false
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: {
      maxProjects: 999,
      maxTeamMembers: 999,
      maxStorage: 50000,
      customFields: true,
      advancedReports: true,
      prioritySupport: true
    }
  }
};

// ============ إنشاء مستخدم افتراضي ============
const defaultUser = {
  id: String(nextId.user++),
  name: 'أحمد محمد',
  email: 'ahmed@test.com',
  password: bcrypt.hashSync('123456', 10),
  role: 'admin',
  createdAt: new Date().toISOString(),
};
users.push(defaultUser);

// إنشاء اشتراك افتراضي للمستخدم
subscriptions.push({
  id: String(nextId.subscription++),
  userId: defaultUser.id,
  plan: 'free',
  status: 'active',
  features: PLANS.free.features,
  startDate: new Date().toISOString(),
  createdAt: new Date().toISOString()
});

// إنشاء مشاريع تجريبية
for (let i = 1; i <= 3; i++) {
  projects.push({
    _id: String(nextId.project++),
    name: `مشروع تجريبي ${i}`,
    description: `هذا مشروع تجريبي رقم ${i} لعرض قدرات المنصة`,
    priority: i === 1 ? 'high' : i === 2 ? 'medium' : 'low',
    status: 'active',
    budget: 10000 * i,
    startDate: new Date().toISOString(),
    endDate: null,
    owner: defaultUser.id,
    createdAt: new Date().toISOString(),
  });
}

// إنشاء مهام تجريبية
const taskStatuses = ['todo', 'in-progress', 'review', 'done'];
const taskPriorities = ['urgent', 'high', 'medium', 'low'];
for (let i = 1; i <= 10; i++) {
  const projectId = projects[Math.floor(Math.random() * projects.length)]._id;
  tasks.push({
    _id: String(nextId.task++),
    title: `مهمة تجريبية ${i}`,
    description: `وصف المهمة التجريبية رقم ${i}`,
    project: projectId,
    priority: taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
    status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
    cost: Math.floor(Math.random() * 5000),
    estimatedHours: Math.floor(Math.random() * 20),
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    labels: ['تجريبي', 'مهم'],
    subtasks: [],
    comments: [],
    attachments: [],
    assignee: null,
    owner: defaultUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

console.log('\n========================================');
console.log('🚀 WorkSphere Server Running');
console.log('========================================');
console.log('✅ Default user created:');
console.log('   Email: ahmed@test.com');
console.log('   Password: 123456');
console.log(`📊 Demo data: ${projects.length} projects, ${tasks.length} tasks`);
console.log('========================================\n');

// ============ دوال مساعدة ============
const createNotification = (userId, type, title, message, data = {}) => {
  const notification = {
    id: String(nextId.notification++),
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  return notification;
};

const createActivity = (userId, userName, action, targetType, targetId, targetName, details = {}) => {
  const activity = {
    id: String(nextId.activity++),
    userId,
    userName,
    action,
    targetType,
    targetId,
    targetName,
    details,
    createdAt: new Date().toISOString(),
  };
  activities.push(activity);
  return activity;
};

const createSubscription = (userId, plan = 'free') => {
  const subscription = {
    id: String(nextId.subscription++),
    userId,
    plan,
    status: 'active',
    features: PLANS[plan].features,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  subscriptions.push(subscription);
  return subscription;
};

const getUserSubscription = (userId) => {
  return subscriptions.find(s => s.userId === userId) || createSubscription(userId);
};

// ============ Middleware التحقق من التوكن ============
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'غير مصرح، لا يوجد توكن' });
  }
  
  try {
    const decoded = jwt.verify(token, 'worksphere_secret_key_2024');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح، تحتاج صلاحيات مدير' });
  }
  next();
};

// ============ Routes المصادقة ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('📝 Register attempt:', email);
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني موجود بالفعل' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(nextId.user++),
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    createSubscription(newUser.id, 'free');
    
    const token = jwt.sign({ id: newUser.id }, 'worksphere_secret_key_2024', {
      expiresIn: '30d',
    });
    
    createActivity(newUser.id, newUser.name, 'user_joined', 'user', newUser.id, newUser.name);
    
    console.log('✅ User registered successfully:', email);
    
    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
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
    
    console.log('📝 Login attempt:', email);
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const token = jwt.sign({ id: user.id }, 'worksphere_secret_key_2024', {
      expiresIn: '30d',
    });
    
    console.log('✅ Login successful:', email);
    
    res.json({
      _id: user.id,
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

app.get('/api/auth/me', protect, (req, res) => {
  res.json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// ============ Routes الاشتراكات ============
app.get('/api/subscription', protect, (req, res) => {
  const subscription = getUserSubscription(req.user.id);
  const projectsCount = projects.filter(p => p.owner === req.user.id).length;
  const teamMembersCount = users.filter(u => u.id !== req.user.id).length;
  
  res.json({
    ...subscription,
    planDetails: PLANS[subscription.plan],
    usage: {
      projects: projectsCount,
      teamMembers: teamMembersCount,
      projectsRemaining: Math.max(0, subscription.features.maxProjects - projectsCount),
      teamMembersRemaining: Math.max(0, subscription.features.maxTeamMembers - teamMembersCount)
    }
  });
});

app.put('/api/subscription/upgrade', protect, (req, res) => {
  const { plan } = req.body;
  
  if (!PLANS[plan]) {
    return res.status(400).json({ message: 'Invalid plan' });
  }
  
  const subscriptionIndex = subscriptions.findIndex(s => s.userId === req.user.id);
  
  if (subscriptionIndex === -1) {
    return res.status(404).json({ message: 'Subscription not found' });
  }
  
  subscriptions[subscriptionIndex].plan = plan;
  subscriptions[subscriptionIndex].features = PLANS[plan].features;
  
  createNotification(req.user.id, 'subscription', 'ترقية الخطة', `تم ترقية حسابك إلى خطة ${PLANS[plan].name}`);
  
  res.json({ message: `Upgraded to ${plan}`, subscription: subscriptions[subscriptionIndex] });
});

// ============ Routes المستخدمين ============
app.get('/api/users', protect, (req, res) => {
  const allUsers = users.map(u => ({
    _id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
  res.json(allUsers);
});

app.put('/api/users/:id', protect, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المستخدم غير موجود' });
  }
  
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'لا يمكنك تعديل مستخدم آخر' });
  }
  
  users[index].name = req.body.name || users[index].name;
  if (req.user.role === 'admin' && req.body.role) {
    users[index].role = req.body.role;
  }
  
  res.json({
    _id: users[index].id,
    name: users[index].name,
    email: users[index].email,
    role: users[index].role,
  });
});

app.delete('/api/users/:id', protect, adminOnly, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المستخدم غير موجود' });
  }
  
  if (users[index].email === 'ahmed@test.com') {
    return res.status(403).json({ message: 'لا يمكن حذف المدير الرئيسي' });
  }
  
  if (req.params.id === req.user.id) {
    return res.status(403).json({ message: 'لا يمكن حذف حسابك الحالي' });
  }
  
  users.splice(index, 1);
  
  res.json({ message: 'تم حذف المستخدم بنجاح' });
});

// ============ Routes المشاريع ============
app.get('/api/projects', protect, (req, res) => {
  let userProjects = projects.filter(p => p.owner === req.user.id);
  
  if (req.user.role === 'admin') {
    userProjects = projects;
  }
  
  res.json(userProjects);
});

app.post('/api/projects', protect, (req, res) => {
  const { name, description, priority, budget, startDate, endDate } = req.body;
  
  const newProject = {
    _id: String(nextId.project++),
    name,
    description: description || '',
    priority: priority || 'medium',
    status: 'active',
    budget: budget || 0,
    startDate: startDate || null,
    endDate: endDate || null,
    owner: req.user.id,
    createdAt: new Date().toISOString(),
  };
  
  projects.push(newProject);
  
  createActivity(req.user.id, req.user.name, 'created_project', 'project', newProject._id, name);
  createNotification(req.user.id, 'project', 'مشروع جديد', `تم إنشاء مشروع جديد: ${name}`);
  
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', protect, (req, res) => {
  const index = projects.findIndex(p => p._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المشروع غير موجود' });
  }
  
  if (projects[index].owner !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح' });
  }
  
  projects[index] = { ...projects[index], ...req.body };
  res.json(projects[index]);
});

app.delete('/api/projects/:id', protect, (req, res) => {
  const index = projects.findIndex(p => p._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المشروع غير موجود' });
  }
  
  if (projects[index].owner !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح' });
  }
  
  projects.splice(index, 1);
  tasks = tasks.filter(t => t.project !== req.params.id);
  
  res.json({ message: 'تم حذف المشروع بنجاح' });
});

// ============ Routes المهام ============
app.get('/api/tasks', protect, (req, res) => {
  const { projectId, status } = req.query;
  
  let userTasks = tasks.filter(t => t.owner === req.user.id);
  
  if (req.user.role === 'admin') {
    userTasks = tasks;
  }
  
  if (projectId) {
    userTasks = userTasks.filter(t => t.project === projectId);
  }
  
  if (status) {
    userTasks = userTasks.filter(t => t.status === status);
  }
  
  const tasksWithProject = userTasks.map(task => {
    const foundProject = projects.find(p => p._id === task.project);
    const assigneeUser = users.find(u => u.id === task.assignee);
    return {
      ...task,
      project: foundProject ? { _id: foundProject._id, name: foundProject.name } : null,
      assignee: assigneeUser ? { _id: assigneeUser.id, name: assigneeUser.name } : null,
    };
  });
  
  res.json(tasksWithProject);
});

app.get('/api/tasks/:id', protect, (req, res) => {
  const task = tasks.find(t => t._id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const foundProject = projects.find(p => p._id === task.project);
  const assigneeUser = users.find(u => u.id === task.assignee);
  
  const taskWithDetails = {
    ...task,
    project: foundProject ? { _id: foundProject._id, name: foundProject.name } : null,
    assignee: assigneeUser ? { _id: assigneeUser.id, name: assigneeUser.name } : null,
  };
  
  res.json(taskWithDetails);
});

app.post('/api/tasks', protect, (req, res) => {
  const { title, description, project, priority, status, cost, estimatedHours, dueDate, labels, assignee } = req.body;
  
  const newTask = {
    _id: String(nextId.task++),
    title,
    description: description || '',
    project,
    priority: priority || 'medium',
    status: status || 'todo',
    cost: cost || 0,
    estimatedHours: estimatedHours || 0,
    dueDate: dueDate || null,
    labels: labels || [],
    subtasks: [],
    comments: [],
    attachments: [],
    assignee: assignee || null,
    owner: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tasks.push(newTask);
  
  createActivity(req.user.id, req.user.name, 'created_task', 'task', newTask._id, title, { projectId: project });
  createNotification(req.user.id, 'task', 'مهمة جديدة', `تم إنشاء مهمة جديدة: ${title}`);
  
  if (assignee && assignee !== req.user.id) {
    const assigneeUser = users.find(u => u.id === assignee);
    if (assigneeUser) {
      createNotification(assignee, 'task_assigned', 'مهمة جديدة', `${req.user.name} عينك في مهمة: ${title}`, { taskId: newTask._id });
    }
  }
  
  const foundProject = projects.find(p => p._id === project);
  const taskWithProject = {
    ...newTask,
    project: foundProject ? { _id: foundProject._id, name: foundProject.name } : null,
  };
  
  res.status(201).json(taskWithProject);
});

app.put('/api/tasks/:id/status', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const newStatus = req.body.status;
  
  tasks[index].status = newStatus;
  tasks[index].updatedAt = new Date().toISOString();
  
  if (newStatus === 'done') {
    createActivity(req.user.id, req.user.name, 'completed_task', 'task', tasks[index]._id, tasks[index].title);
    createNotification(req.user.id, 'task', 'مهمة مكتملة', `تم إكمال المهمة: ${tasks[index].title}`);
  } else {
    createActivity(req.user.id, req.user.name, 'updated_task', 'task', tasks[index]._id, tasks[index].title);
  }
  
  if (tasks[index].assignee && tasks[index].assignee !== req.user.id) {
    createNotification(tasks[index].assignee, 'task_updated', 'تحديث المهمة', `تم تحديث حالة المهمة: ${tasks[index].title}`, { taskId: tasks[index]._id });
  }
  
  const foundProject = projects.find(p => p._id === tasks[index].project);
  const taskWithProject = {
    ...tasks[index],
    project: foundProject ? { _id: foundProject._id, name: foundProject.name } : null,
  };
  
  res.json(taskWithProject);
});

app.put('/api/tasks/:id', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  tasks[index] = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
  
  const foundProject = projects.find(p => p._id === tasks[index].project);
  const taskWithProject = {
    ...tasks[index],
    project: foundProject ? { _id: foundProject._id, name: foundProject.name } : null,
  };
  
  res.json(taskWithProject);
});

app.delete('/api/tasks/:id', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  tasks.splice(index, 1);
  res.json({ message: 'تم حذف المهمة بنجاح' });
});

app.post('/api/tasks/:id/comments', protect, (req, res) => {
  const taskIndex = tasks.findIndex(t => t._id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const newComment = {
    _id: String(Date.now()),
    userId: req.user.id,
    userName: req.user.name,
    content: req.body.content,
    createdAt: new Date().toISOString(),
  };
  
  if (!tasks[taskIndex].comments) {
    tasks[taskIndex].comments = [];
  }
  
  tasks[taskIndex].comments.push(newComment);
  
  createActivity(req.user.id, req.user.name, 'commented_task', 'comment', tasks[taskIndex]._id, tasks[taskIndex].title, { comment: req.body.content });
  
  if (tasks[taskIndex].owner !== req.user.id) {
    createNotification(tasks[taskIndex].owner, 'comment_added', 'تعليق جديد', `${req.user.name} علق على مهمتك: ${tasks[taskIndex].title}`, { taskId: tasks[taskIndex]._id });
  }
  
  res.json(tasks[taskIndex]);
});

app.post('/api/tasks/:id/subtasks', protect, (req, res) => {
  const taskIndex = tasks.findIndex(t => t._id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const newSubtask = {
    id: String(Date.now()),
    title: req.body.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  
  if (!tasks[taskIndex].subtasks) {
    tasks[taskIndex].subtasks = [];
  }
  
  tasks[taskIndex].subtasks.push(newSubtask);
  res.json(tasks[taskIndex]);
});

app.put('/api/tasks/:id/subtasks/:subtaskId', protect, (req, res) => {
  const taskIndex = tasks.findIndex(t => t._id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'المهمة غير موجودة' });
  }
  
  const subtaskIndex = tasks[taskIndex].subtasks.findIndex(s => s.id === req.params.subtaskId);
  
  if (subtaskIndex === -1) {
    return res.status(404).json({ message: 'المهمة الفرعية غير موجودة' });
  }
  
  tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
  res.json(tasks[taskIndex]);
});

// ============ Routes الأنشطة ============
app.get('/api/activities', protect, (req, res) => {
  const { limit = 50 } = req.query;
  
  let userActivities = activities;
  
  if (req.user.role !== 'admin') {
    userActivities = activities.filter(a => a.userId === req.user.id);
  }
  
  const sortedActivities = userActivities.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, parseInt(limit));
  
  res.json({ activities: sortedActivities });
});

// ============ Routes الإشعارات ============
app.get('/api/notifications', protect, (req, res) => {
  const userNotifications = notifications
    .filter(n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
  
  const unreadCount = notifications.filter(n => n.userId === req.user.id && !n.read).length;
  
  res.json({ notifications: userNotifications, unreadCount });
});

app.put('/api/notifications/:id/read', protect, (req, res) => {
  const index = notifications.findIndex(n => n.id === req.params.id);
  
  if (index !== -1 && notifications[index].userId === req.user.id) {
    notifications[index].read = true;
  }
  
  res.json({ message: 'تم تحديث الإشعار' });
});

app.put('/api/notifications/read-all', protect, (req, res) => {
  notifications.forEach(n => {
    if (n.userId === req.user.id) {
      n.read = true;
    }
  });
  res.json({ message: 'تم تحديث جميع الإشعارات' });
});

// ============ Routes الإحصائيات ============
app.get('/api/tasks/stats', protect, (req, res) => {
  let userTasks = tasks.filter(t => t.owner === req.user.id);
  
  if (req.user.role === 'admin') {
    userTasks = tasks;
  }
  
  const total = userTasks.length;
  const completed = userTasks.filter(t => t.status === 'done').length;
  const inProgress = userTasks.filter(t => t.status === 'in-progress').length;
  const todo = userTasks.filter(t => t.status === 'todo').length;
  const review = userTasks.filter(t => t.status === 'review').length;
  const overdue = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  
  const byPriority = [
    { priority: 'urgent', count: userTasks.filter(t => t.priority === 'urgent').length },
    { priority: 'high', count: userTasks.filter(t => t.priority === 'high').length },
    { priority: 'medium', count: userTasks.filter(t => t.priority === 'medium').length },
    { priority: 'low', count: userTasks.filter(t => t.priority === 'low').length },
  ];
  
  const totalCost = userTasks.reduce((sum, t) => sum + (t.cost || 0), 0);
  const totalHours = userTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  
  res.json({ total, completed, inProgress, todo, review, overdue, byPriority, totalCost, totalHours });
});

// ============ فحص صحة الخادم ============
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    stats: {
      users: users.length,
      projects: projects.length,
      tasks: tasks.length,
      notifications: notifications.length,
      activities: activities.length
    }
  });
});

// ============ إنشاء مجلد uploads إذا لم يكن موجوداً ============
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============ رفع الملفات ============
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/tasks/:taskId/attachments', protect, upload.single('file'), (req, res) => {
  const task = tasks.find(t => t._id === req.params.taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const fileData = {
    id: Date.now().toString(),
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    uploadedBy: req.user.id,
    uploadedAt: new Date().toISOString()
  };
  
  if (!task.attachments) task.attachments = [];
  task.attachments.push(fileData);
  
  res.json({ message: 'File uploaded successfully', file: fileData });
});

app.delete('/api/tasks/:taskId/attachments/:attachmentId', protect, (req, res) => {
  const task = tasks.find(t => t._id === req.params.taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const attachment = task.attachments.find(a => a.id === req.params.attachmentId);
  if (attachment) {
    const filePath = path.join(uploadsDir, path.basename(attachment.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    task.attachments = task.attachments.filter(a => a.id !== req.params.attachmentId);
  }
  
  res.json({ message: 'File deleted successfully' });
});

app.get('/uploads/:filename', (req, res) => {
  const filepath = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// ============ تشغيل الخادم ============
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📁 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`✅ Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications\n`);
});