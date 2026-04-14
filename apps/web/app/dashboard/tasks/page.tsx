'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Clock, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/forms/TaskForm';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  cost: number;
  estimatedHours: number;
  project: { _id: string; name: string };
  dueDate: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    totalCost: 0,
    totalHours: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // جلب المهام والمشاريع معاً
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      
      // حساب الإحصائيات
      const completed = tasksRes.data.filter((t: Task) => t.status === 'done').length;
      const totalCost = tasksRes.data.reduce((sum: number, t: Task) => sum + (t.cost || 0), 0);
      const totalHours = tasksRes.data.reduce((sum: number, t: Task) => sum + (t.estimatedHours || 0), 0);
      
      setStats({
        total: tasksRes.data.length,
        completed,
        totalCost,
        totalHours,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/tasks', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([response.data, ...tasks]);
      setIsModalOpen(false);
      fetchData(); // تحديث الإحصائيات
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => t._id === taskId ? response.data : t));
      fetchData(); // تحديث الإحصائيات
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(tasks.filter(t => t._id !== taskId));
        fetchData(); // تحديث الإحصائيات
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => filter === 'all' ? true : task.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجلة';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      default: return 'منخفضة';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'قيد الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'review': return 'مراجعة';
      case 'done': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-500/20 text-gray-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'review': return 'bg-purple-500/20 text-purple-400';
      case 'done': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">المهام</h1>
        <p className="text-gray-400 mt-2">إدارة وتتبع المهام مع التكاليف وساعات العمل</p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">إجمالي المهام</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">المهام المكتملة</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">إجمالي التكاليف</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.totalCost.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">ساعات العمل</p>
          <p className="text-2xl font-bold text-purple-400">{stats.totalHours} ساعة</p>
        </div>
      </div>

      {/* أزرار الفلتر */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'todo', 'in-progress', 'review', 'done'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'الكل' : getStatusText(status)}
          </Button>
        ))}
        <Button onClick={() => setIsModalOpen(true)} className="mr-auto">
          <Plus className="w-4 h-4 ml-2" />
          مهمة جديدة
        </Button>
      </div>

      {/* قائمة المهام */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="hover:border-purple-500/30 transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{task.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-400">
                    📁 {task.project?.name || 'بدون مشروع'}
                  </span>
                  {task.cost > 0 && (
                    <span className="text-green-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {task.cost.toLocaleString()} ج.م
                    </span>
                  )}
                  {task.estimatedHours > 0 && (
                    <span className="text-blue-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedHours} ساعة
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-gray-400">
                      📅 {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {task.status !== 'done' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateTaskStatus(task._id, 'done')}
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    إكمال
                  </Button>
                )}
                <button
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">لا توجد مهام</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            أضف أول مهمة
          </Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة مهمة جديدة">
        <TaskForm
          projects={projects}
          onSubmit={handleCreateTask}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}