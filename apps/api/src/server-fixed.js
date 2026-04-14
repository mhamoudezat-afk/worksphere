const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();

// ============ إعدادات متقدمة ============
app.set('trust proxy', 1);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  validate: { xForwardedForHeader: false },
});
app.use(limiter);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://worksphere.vercel.app',
  'https://worksphere-t1jv.vercel.app',
  'https://worksphere33.netlify.app',
  'https://worksphere-cvk5.vercel.app',  // أضف هذا
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ قاعدة بيانات مؤقتة ============
let users = [];
let projects = [];
let tasks = [];
let expenses = [];
let employees = [];
let salaries = [];

let nextId = {
  user: 1,
  project: 1,
  task: 1,
  expense: 1,
  employee: 1,
  salary: 1,
};

// ============ إنشاء مستخدم Admin افتراضي ============
const defaultUser = {
  id: String(nextId.user++),
  name: 'أحمد محمد',
  email: 'admin@worksphere.com',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  createdAt: new Date().toISOString(),
};
users.push(defaultUser);

// ============ بيانات تجريبية ============
for (let i = 1; i <= 3; i++) {
  projects.push({
    _id: String(nextId.project++),
    name: `مشروع تجريبي ${i}`,
    description: `وصف المشروع التجريبي رقم ${i}`,
    priority: i === 1 ? 'high' : i === 2 ? 'medium' : 'low',
    status: 'active',
    budget: 10000 * i,
    spent: 0,
    userId: defaultUser.id,
    createdAt: new Date().toISOString(),
  });
}

for (let i = 1; i <= 10; i++) {
  tasks.push({
    _id: String(nextId.task++),
    title: `مهمة تجريبية ${i}`,
    description: `وصف المهمة رقم ${i}`,
    projectId: projects[Math.floor(Math.random() * projects.length)]._id,
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['todo', 'in-progress', 'review', 'done'][Math.floor(Math.random() * 4)],
    cost: Math.floor(Math.random() * 5000),
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    userId: defaultUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

console.log('\n========================================');
console.log('🚀 WorkSphere Server Running');
console.log('========================================');
console.log('📧 Admin: admin@worksphere.com');
console.log('🔑 Password: admin123');
console.log(`📊 Demo: ${projects.length} projects, ${tasks.length} tasks`);
console.log('========================================\n');

// ============ Middleware ============
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'غير مصرح، لا يوجد توكن' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'worksphere_secret_2024');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
};

// ============ Auth Routes ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني موجود بالفعل' });
    }
    
    const newUser = {
      id: String(nextId.user++),
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      role: 'member',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    
    const token = jwt.sign({ id: newUser.id }, 'worksphere_secret_2024', { expiresIn: '7d' });
    
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
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const token = jwt.sign({ id: user.id }, 'worksphere_secret_2024', { expiresIn: '7d' });
    
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
  res.json(req.user);
});

// ============ User Routes ============
app.get('/api/users', protect, (req, res) => {
  const allUsers = users.map(u => ({
    _id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
  res.json(allUsers);
});

app.put('/api/users/:id', protect, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'المستخدم غير موجود' });
  
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

app.delete('/api/users/:id', protect, async (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'المستخدم غير موجود' });
  
  if (users[index].email === 'admin@worksphere.com') {
    return res.status(403).json({ message: 'لا يمكن حذف المدير الرئيسي' });
  }
  
  if (req.params.id === req.user.id) {
    return res.status(403).json({ message: 'لا يمكن حذف حسابك الحالي' });
  }
  
  users.splice(index, 1);
  res.json({ message: 'تم حذف المستخدم' });
});

// ============ Project Routes ============
app.get('/api/projects', protect, (req, res) => {
  const userProjects = projects.filter(p => p.userId === req.user.id);
  res.json(userProjects);
});

app.get('/api/projects/:id', protect, (req, res) => {
  const project = projects.find(p => p._id === req.params.id && p.userId === req.user.id);
  if (!project) return res.status(404).json({ message: 'المشروع غير موجود' });
  res.json(project);
});

app.post('/api/projects', protect, (req, res) => {
  const { name, description, priority, budget } = req.body;
  
  const newProject = {
    _id: String(nextId.project++),
    name,
    description: description || '',
    priority: priority || 'medium',
    status: 'active',
    budget: budget || 0,
    spent: 0,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', protect, (req, res) => {
  const index = projects.findIndex(p => p._id === req.params.id && p.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المشروع غير موجود' });
  
  projects[index] = { ...projects[index], ...req.body };
  res.json(projects[index]);
});

app.delete('/api/projects/:id', protect, (req, res) => {
  const index = projects.findIndex(p => p._id === req.params.id && p.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المشروع غير موجود' });
  
  projects.splice(index, 1);
  tasks = tasks.filter(t => t.projectId !== req.params.id);
  res.json({ message: 'تم حذف المشروع' });
});

// ============ Task Routes ============
app.get('/api/tasks', protect, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

app.get('/api/tasks/:id', protect, (req, res) => {
  const task = tasks.find(t => t._id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ message: 'المهمة غير موجودة' });
  res.json(task);
});

app.post('/api/tasks', protect, (req, res) => {
  const { title, description, projectId, priority, dueDate } = req.body;
  
  const newTask = {
    _id: String(nextId.task++),
    title,
    description: description || '',
    projectId,
    priority: priority || 'medium',
    status: 'todo',
    dueDate: dueDate || null,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id/status', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  tasks[index].status = req.body.status;
  tasks[index].updatedAt = new Date().toISOString();
  res.json(tasks[index]);
});

app.put('/api/tasks/:id', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  tasks[index] = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  tasks.splice(index, 1);
  res.json({ message: 'تم حذف المهمة' });
});

app.post('/api/tasks/:id/comments', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  const newComment = {
    id: String(Date.now()),
    userId: req.user.id,
    userName: req.user.name,
    content: req.body.content,
    createdAt: new Date().toISOString(),
  };
  
  if (!tasks[index].comments) tasks[index].comments = [];
  tasks[index].comments.push(newComment);
  res.json(tasks[index]);
});

// ============ Expense Routes ============
app.get('/api/expenses', protect, (req, res) => {
  const userExpenses = expenses.filter(e => e.userId === req.user.id);
  res.json(userExpenses);
});

app.post('/api/expenses', protect, (req, res) => {
  const { name, amount, type, date } = req.body;
  
  const newExpense = {
    _id: String(nextId.expense++),
    name,
    amount: amount || 0,
    type: type || 'operations',
    date: date || new Date().toISOString(),
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };
  
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.delete('/api/expenses/:id', protect, (req, res) => {
  const index = expenses.findIndex(e => e._id === req.params.id && e.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المصروف غير موجود' });
  
  expenses.splice(index, 1);
  res.json({ message: 'تم حذف المصروف' });
});

// ============ Employee Routes ============
app.get('/api/employees', protect, (req, res) => {
  const userEmployees = employees.filter(e => e.userId === req.user.id);
  res.json(userEmployees);
});

app.post('/api/employees', protect, (req, res) => {
  const { name, position, baseSalary, phone, email } = req.body;
  
  const newEmployee = {
    _id: String(nextId.employee++),
    name,
    position,
    baseSalary: baseSalary || 0,
    phone: phone || '',
    email: email || '',
    status: 'active',
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };
  
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.delete('/api/employees/:id', protect, (req, res) => {
  const index = employees.findIndex(e => e._id === req.params.id && e.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'الموظف غير موجود' });
  
  employees.splice(index, 1);
  res.json({ message: 'تم حذف الموظف' });
});

// ============ Salary Routes ============
app.get('/api/salaries', protect, (req, res) => {
  const userSalaries = salaries.filter(s => s.userId === req.user.id);
  res.json(userSalaries);
});

app.post('/api/salaries', protect, (req, res) => {
  const { employeeId, employeeName, baseSalary, bonus, deductions, month, year } = req.body;
  
  const netSalary = (baseSalary || 0) + (bonus || 0) - (deductions || 0);
  
  const newSalary = {
    _id: String(nextId.salary++),
    employeeId,
    employeeName,
    baseSalary: baseSalary || 0,
    bonus: bonus || 0,
    deductions: deductions || 0,
    netSalary,
    month,
    year: year || new Date().getFullYear(),
    status: 'paid',
    paidDate: new Date().toISOString(),
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };
  
  salaries.push(newSalary);
  
  // Add to expenses automatically
  expenses.push({
    _id: String(nextId.expense++),
    name: `مرتب: ${employeeName} - ${month}/${year}`,
    amount: netSalary,
    type: 'salary',
    date: new Date().toISOString(),
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  });
  
  res.status(201).json(newSalary);
});

// ============ Dashboard Routes ============
app.get('/api/dashboard/stats', protect, (req, res) => {
  const userProjects = projects.filter(p => p.userId === req.user.id);
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  const userExpenses = expenses.filter(e => e.userId === req.user.id);
  
  const totalBudget = userProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = userProjects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const totalExpenses = userExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const completedTasks = userTasks.filter(t => t.status === 'done').length;
  
  res.json({
    totalProjects: userProjects.length,
    totalTasks: userTasks.length,
    completedTasks,
    totalBudget,
    totalSpent,
    totalExpenses,
    remainingBudget: totalBudget - totalSpent,
  });
});

app.get('/api/dashboard/kpis', protect, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  const userProjects = projects.filter(p => p.userId === req.user.id);
  
  const completedTasks = userTasks.filter(t => t.status === 'done').length;
  const overdueTasks = userTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;
  const completionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
  
  res.json({
    totalProjects: userProjects.length,
    totalTasks: userTasks.length,
    completedTasks,
    overdueTasks,
    completionRate: Math.round(completionRate),
    activeTeamMembers: users.length,
  });
});

app.get('/api/dashboard/insights', protect, (req, res) => {
  const userProjects = projects.filter(p => p.userId === req.user.id);
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  
  const behindSchedule = userProjects
    .filter(p => p.endDate && new Date(p.endDate) < new Date())
    .map(p => ({ projectName: p.name, daysLate: Math.floor((new Date().getTime() - new Date(p.endDate).getTime()) / (1000 * 3600 * 24)) }));
  
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const urgentTasks = userTasks
    .filter(t => t.dueDate && new Date(t.dueDate) <= threeDaysFromNow && t.status !== 'done')
    .map(t => ({ title: t.title, dueDate: t.dueDate }));
  
  res.json({ behindSchedule, urgentTasks, topPerformers: [] });
});

// ============ Company Budget ==========
let companyBudget = { total: 100000, spent: 0, remaining: 100000 };

app.get('/api/company/budget', protect, (req, res) => {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({
    totalBudget: companyBudget.total,
    spentBudget: totalSpent,
    remainingBudget: companyBudget.total - totalSpent,
  });
});

app.put('/api/company/budget', protect, (req, res) => {
  const { totalBudget } = req.body;
  if (totalBudget && totalBudget > 0) {
    companyBudget.total = totalBudget;
  }
  res.json({ message: 'تم تحديث الميزانية', budget: companyBudget });
});

// ============ Financial Summary ==========
app.get('/api/finance/summary', protect, (req, res) => {
  const userExpenses = expenses.filter(e => e.userId === req.user.id);
  const userProjects = projects.filter(p => p.userId === req.user.id);
  const userSalaries = salaries.filter(s => s.userId === req.user.id);
  
  const totalExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = userSalaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalBudget = userProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = userProjects.reduce((sum, p) => sum + (p.spent || 0), 0);
  
  const byType = {
    equipment: userExpenses.filter(e => e.type === 'equipment').reduce((s, e) => s + e.amount, 0),
    marketing: userExpenses.filter(e => e.type === 'marketing').reduce((s, e) => s + e.amount, 0),
    operations: userExpenses.filter(e => e.type === 'operations').reduce((s, e) => s + e.amount, 0),
    salary: totalSalaries,
    tax: 0,
    inventory: 0,
  };
  
  res.json({
    totalBudget,
    totalSpent,
    remainingBudget: totalBudget - totalSpent,
    totalExpenses,
    totalSalaries,
    byType,
    projectsCount: userProjects.length,
    expensesCount: userExpenses.length,
    salariesCount: userSalaries.length,
  });
});

// ============ Health Check ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ Start Server ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST /api/auth/login`);
  console.log(`📁 Projects: GET /api/projects`);
  console.log(`✅ Tasks: GET /api/tasks`);
  console.log(`========================================\n`);
});