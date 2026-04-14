'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Task {
  _id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
}

export default function UpcomingDeadlines() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingTasks = response.data
        .filter((task: Task) => 
          task.dueDate && 
          new Date(task.dueDate) >= today && 
          new Date(task.dueDate) <= nextWeek &&
          task.status !== 'done'
        )
        .sort((a: Task, b: Task) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      
      setTasks(upcomingTasks);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-semibold">المواعيد النهائية القادمة</h3>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد مواعيد نهائية قادمة</p>
          <p className="text-gray-500 text-sm">ممتاز! كل المهام في موعدها</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const daysRemaining = getDaysRemaining(task.dueDate);
            const isUrgent = daysRemaining <= 2;
            
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-xl border ${
                  isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-700/30 border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'urgent' ? 'عاجل' : 
                         task.priority === 'high' ? 'عالي' :
                         task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-center min-w-[60px] ${
                    isUrgent ? 'text-red-400' : daysRemaining <= 5 ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    <p className="text-lg font-bold">{daysRemaining}</p>
                    <p className="text-xs">يوم متبقي</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}