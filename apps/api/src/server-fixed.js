const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();

// ============ Trust Proxy (لـ Railway/Render) ============
app.set('trust proxy', 1);

// ============ CORS Configuration ============
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://worksphere-t1jv.vercel.app',
  'https://worksphere.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============ Rate Limiting (Production Ready) ============
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use the X-Forwarded-For header when behind a proxy
    return req.headers['x-forwarded-for'] || req.ip;
  },
});

app.use(limiter);

// ============ Body Parser ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ Database (In-Memory for demo) ============
let users = [];
let projects = [];
let tasks = [];
let nextId = { user: 1, project: 1, task: 1 };

// Create default admin
const defaultUser = {
  id: String(nextId.user++),
  name: 'أحمد محمد',
  email: 'admin@worksphere.com',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  createdAt: new Date().toISOString(),
};
users.push(defaultUser);

// Demo projects
for (let i = 1; i <= 3; i++) {
  projects.push({
    _id: String(nextId.project++),
    name: `مشروع تجريبي ${i}`,
    description: `وصف المشروع التجريبي ${i}`,
    priority: i === 1 ? 'high' : i === 2 ? 'medium' : 'low',
    status: 'active',
    budget: 10000 * i,
    spent: 0,
    userId: defaultUser.id,
    createdAt: new Date().toISOString(),
  });
}

// Demo tasks
for (let i = 1; i <= 10; i++) {
  tasks.push({
    _id: String(nextId.task++),
    title: `مهمة تجريبية ${i}`,
    description: `وصف المهمة ${i}`,
    projectId: projects[Math.floor(Math.random() * projects.length)]._id,
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['todo', 'in-progress', 'review', 'done'][Math.floor(Math.random() * 4)],
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    userId: defaultUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

console.log('\n========================================');
console.log('🚀 WorkSphere Server Running');
console.log('========================================');
console.log(`📧 Admin: admin@worksphere.com`);
console.log(`🔑 Password: admin123`);
console.log(`📊 Demo: ${projects.length} projects, ${tasks.length} tasks`);
console.log(`🌐 CORS Enabled for: ${allowedOrigins.join(', ')}`);
console.log('========================================\n');

// ============ Auth Middleware ============
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
    
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'worksphere_secret_2024', {
      expiresIn: '7d',
    });
    
    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token,
    });
  } catch (error) {
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
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'worksphere_secret_2024', {
      expiresIn: '7d',
    });
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json(req.user);
});

// ============ Project Routes ============
app.get('/api/projects', protect, (req, res) => {
  const userProjects = projects.filter(p => p.userId === req.user.id);
  res.json(userProjects);
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

app.delete('/api/tasks/:id', protect, (req, res) => {
  const index = tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'المهمة غير موجودة' });
  
  tasks.splice(index, 1);
  res.json({ message: 'تم حذف المهمة' });
});

// ============ Health Check ============
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ Start Server ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS Enabled for production`);
});