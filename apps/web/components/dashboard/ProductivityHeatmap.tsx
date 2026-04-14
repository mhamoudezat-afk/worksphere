'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface DayData {
  date: string;
  day: string;
  tasks: number;
  intensity: number;
}

export default function ProductivityHeatmap() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProductivity, setTotalProductivity] = useState(0);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      const response = await api.get('/tasks');
      const tasks = response.data;
      
      const days = [];
      const today = new Date();
      let total = 0;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTasks = tasks.filter((task: any) => {
          const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
          return taskDate === dateStr;
        });
        
        const count = dayTasks.length;
        total += count;
        
        days.push({
          date: dateStr,
          day: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
          tasks: count,
          intensity: Math.min(100, (count / 5) * 100),
        });
      }
      
      setData(days);
      setTotalProductivity(total);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-700';
    if (intensity < 25) return 'bg-green-900/50';
    if (intensity < 50) return 'bg-green-800/50';
    if (intensity < 75) return 'bg-green-700/50';
    return 'bg-green-600/50';
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-7 gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h3 className="text-white font-semibold">خريطة الإنتاجية</h3>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm">إجمالي: {totalProductivity} مهمة</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
          <div key={day} className="text-center text-gray-400 text-xs py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {data.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.005 }}
            className={`h-16 rounded-lg ${getIntensityColor(day.intensity)} flex flex-col items-center justify-center p-1 hover:scale-110 transition-transform cursor-pointer`}
            title={`${day.date}: ${day.tasks} مهام`}
          >
            <span className="text-white text-sm font-medium">{day.day}</span>
            <span className="text-gray-300 text-xs">{day.tasks}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-700 rounded"></div>
          <span className="text-gray-500 text-xs">0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-900/50 rounded"></div>
          <span className="text-gray-500 text-xs">1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-800/50 rounded"></div>
          <span className="text-gray-500 text-xs">3-4</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-700/50 rounded"></div>
          <span className="text-gray-500 text-xs">5-6</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600/50 rounded"></div>
          <span className="text-gray-500 text-xs">7+</span>
        </div>
      </div>
    </div>
  );
}