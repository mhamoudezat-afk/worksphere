'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  project?: { name: string };
}

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // أيام الشهر السابق
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    // أيام الشهر الحالي
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // أيام الشهر التالي
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold text-lg">التقويم</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(({ date, isCurrentMonth }, index) => {
          const dayTasks = getTasksForDate(date);
          const hasTasks = dayTasks.length > 0;
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedDate(date)}
              className={`min-h-[100px] p-2 rounded-xl text-right transition-all ${
                isCurrentMonth ? 'bg-gray-700/30' : 'bg-gray-800/30 opacity-50'
              } ${isToday ? 'ring-2 ring-purple-500' : ''} ${
                isSelected ? 'bg-purple-500/20 ring-1 ring-purple-500' : 'hover:bg-gray-700/50'
              }`}
            >
              <span className={`text-sm font-medium ${
                isToday ? 'text-purple-400' : 'text-gray-300'
              }`}>
                {date.getDate()}
              </span>
              
              {hasTasks && (
                <div className="mt-2 space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task._id}
                      className={`text-xs p-1 rounded ${getPriorityColor(task.priority)} truncate`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{dayTasks.length - 2} أكثر
                    </div>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Date Tasks Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg">
                مهام {selectedDate.toLocaleDateString('ar-EG')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {getTasksForDate(selectedDate).map(task => (
                <div key={task._id} className={`p-3 rounded-lg border ${getPriorityColor(task.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{task.title}</p>
                      <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      {task.project && (
                        <p className="text-gray-500 text-xs mt-2">
                          المشروع: {task.project.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span className="text-gray-400">
                        {new Date(task.dueDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {getTasksForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد مهام في هذا اليوم</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}