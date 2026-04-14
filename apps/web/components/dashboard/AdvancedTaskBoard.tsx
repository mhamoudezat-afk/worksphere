'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, CheckSquare, Square, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee?: { name: string };
}

const columns = [
  { id: 'todo', title: '📋 قائمة المهام', color: 'from-gray-500 to-gray-600' },
  { id: 'in-progress', title: '⚙️ قيد التنفيذ', color: 'from-blue-500 to-blue-600' },
  { id: 'review', title: '🔍 مراجعة', color: 'from-purple-500 to-purple-600' },
  { id: 'done', title: '✅ مكتمل', color: 'from-green-500 to-green-600' },
];

function TaskBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-gray-800/30 rounded-2xl p-4">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-24 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdvancedTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [bulkMode, setBulkMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filters]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
      setFilteredTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('فشل في تحميل المهام');
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    
    setFilteredTasks(filtered);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const task = tasks.find(t => t._id === active.id);
    const newStatus = over.id as string;
    
    if (task && task.status !== newStatus) {
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      
      try {
        await api.put(`/tasks/${task._id}/status`, { status: newStatus });
        toast.success(`تم نقل المهمة إلى ${columns.find(c => c.id === newStatus)?.title}`);
      } catch (error) {
        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: task.status } : t));
        toast.error('فشل تحديث حالة المهمة');
      }
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const bulkDelete = async () => {
    if (!confirm(`حذف ${selectedTasks.length} مهمة؟`)) return;
    
    try {
      await Promise.all(selectedTasks.map(id => api.delete(`/tasks/${id}`)));
      setTasks(prev => prev.filter(t => !selectedTasks.includes(t._id)));
      setSelectedTasks([]);
      setBulkMode(false);
      toast.success('تم حذف المهام بنجاح');
    } catch (error) {
      toast.error('فشل حذف المهام');
    }
  };

  const bulkStatusUpdate = async (newStatus: string) => {
    try {
      await Promise.all(selectedTasks.map(id => 
        api.put(`/tasks/${id}/status`, { status: newStatus })
      ));
      setTasks(prev => prev.map(t => 
        selectedTasks.includes(t._id) ? { ...t, status: newStatus } : t
      ));
      setSelectedTasks([]);
      setBulkMode(false);
      toast.success(`تم تحديث ${selectedTasks.length} مهمة`);
    } catch (error) {
      toast.error('فشل تحديث المهام');
    }
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  if (loading) return <TaskBoardSkeleton />;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن مهمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-4 py-3 rounded-xl transition-all ${
              bulkMode ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 border border-gray-700'
            }`}
          >
            {bulkMode ? 'إلغاء' : 'تحديد متعدد'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
              Object.values(filters).some(f => f) ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 border border-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            فلترة
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && selectedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/20 rounded-xl p-3 flex items-center justify-between"
        >
          <span className="text-white">تم تحديد {selectedTasks.length} مهمة</span>
          <div className="flex gap-2">
            <select
              onChange={(e) => bulkStatusUpdate(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 rounded-lg text-white text-sm"
              defaultValue=""
            >
              <option value="" disabled>تغيير الحالة</option>
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 bg-red-600 rounded-lg text-white text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/50 rounded-xl p-4 flex gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white"
              >
                <option value="">كل الحالات</option>
                <option value="todo">قائمة المهام</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="review">مراجعة</option>
                <option value="done">مكتمل</option>
              </select>
              
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white"
              >
                <option value="">كل الأولويات</option>
                <option value="urgent">عاجلة</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
              
              <button
                onClick={() => setFilters({ status: '', priority: '' })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[800px]">
            {columns.map((column) => (
              <div key={column.id} className="bg-gray-800/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${column.color} text-white`}>
                    {getTasksByStatus(column.id).length}
                  </div>
                </div>
                
                <SortableContext
                  items={getTasksByStatus(column.id).map(t => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px]">
                    <AnimatePresence>
                      {getTasksByStatus(column.id).map((task) => (
                        <div key={task._id} className="relative group">
                          {bulkMode && (
                            <button
                              onClick={() => toggleTaskSelection(task._id)}
                              className="absolute -right-2 -top-2 z-10 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center"
                            >
                              {selectedTasks.includes(task._id) ? (
                                <CheckSquare className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          )}
                          <TaskCard task={task} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}