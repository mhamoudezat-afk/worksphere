// apps/api/src/server-final.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ========== CORS Configuration (Open for all) ==========
app.use(cors({
    origin: '*', // يسمح لأي Frontend بالاتصال
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== In-Memory Database ==========
let users = [];
let projects = [];
let tasks = [];
let nextId = { user: 1, project: 1, task: 1 };

// ========== Create Default Admin ==========
const defaultAdmin = {
    id: String(nextId.user++),
    name: 'Admin User',
    email: 'admin@worksphere.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
};
users.push(defaultAdmin);

// ========== Demo Data ==========
for (let i = 1; i <= 3; i++) {
    projects.push({
        _id: String(nextId.project++),
        name: `Project ${i}`,
        description: `Demo project number ${i}`,
        priority: i === 1 ? 'high' : i === 2 ? 'medium' : 'low',
        status: 'active',
        budget: 10000 * i,
        spent: 0,
        userId: defaultAdmin.id,
        createdAt: new Date().toISOString(),
    });
}

for (let i = 1; i <= 5; i++) {
    tasks.push({
        _id: String(nextId.task++),
        title: `Task ${i}`,
        description: `This is task number ${i}`,
        projectId: projects[Math.floor(Math.random() * projects.length)]._id,
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        status: ['todo', 'in-progress', 'review', 'done'][Math.floor(Math.random() * 4)],
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        userId: defaultAdmin.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
}

console.log('\n========================================');
console.log('🚀 WorkSphere Server (FINAL VERSION)');
console.log('========================================');
console.log('📧 Admin: admin@worksphere.com');
console.log('🔑 Password: admin123');
console.log(`📊 Demo: ${projects.length} projects, ${tasks.length} tasks`);
console.log('========================================\n');

// ========== Auth Middleware ==========
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, 'worksphere_secret_2024');
        const user = users.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const userExists = users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
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
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
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
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/me', protect, (req, res) => {
    res.json(req.user);
});

// ========== USER ROUTES ==========
app.get('/api/users', protect, (req, res) => {
    const allUsers = users.map(u => ({
        _id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
    }));
    res.json(allUsers);
});

// ========== PROJECT ROUTES ==========
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
    if (index === -1) return res.status(404).json({ message: 'Project not found' });

    projects[index] = { ...projects[index], ...req.body };
    res.json(projects[index]);
});

app.delete('/api/projects/:id', protect, (req, res) => {
    const index = projects.findIndex(p => p._id === req.params.id && p.userId === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'Project not found' });

    projects.splice(index, 1);
    tasks = tasks.filter(t => t.projectId !== req.params.id);
    res.json({ message: 'Project deleted' });
});

// ========== TASK ROUTES ==========
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
    if (index === -1) return res.status(404).json({ message: 'Task not found' });

    tasks[index].status = req.body.status;
    tasks[index].updatedAt = new Date().toISOString();
    res.json(tasks[index]);
});

app.delete('/api/tasks/:id', protect, (req, res) => {
    const index = tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'Task not found' });

    tasks.splice(index, 1);
    res.json({ message: 'Task deleted' });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/health`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
});