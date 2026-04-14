'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Activity, Calendar } from 'lucide-react';

const data = [
  { day: 'الأحد', مكتمل: 12, منشأ: 8, قيمة: 15000 },
  { day: 'الإثنين', مكتمل: 15, منشأ: 10, قيمة: 22000 },
  { day: 'الثلاثاء', مكتمل: 18, منشأ: 14, قيمة: 18000 },
  { day: 'الأربعاء', مكتمل: 22, منشأ: 18, قيمة: 25000 },
  { day: 'الخميس', مكتمل: 20, منشأ: 16, قيمة: 20000 },
  { day: 'الجمعة', مكتمل: 14, منشأ: 12, قيمة: 12000 },
  { day: 'السبت', مكتمل: 10, منشأ: 8, قيمة: 8000 },
];

export default function PerformanceChart() {
  const [chartType, setChartType] = useState<'tasks' | 'financial'>('tasks');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full rounded-xl bg-gray-800/30 backdrop-blur-sm p-3 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-white font-medium text-sm">تحليلات الأداء</h3>
        </div>
        
        <div className="flex gap-1">
          {/* Time Range */}
          <div className="flex gap-0.5 ml-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
              </button>
            ))}
          </div>
          
          {/* Chart Type */}
          <div className="flex gap-0.5">
            <button
              onClick={() => setChartType('tasks')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all flex items-center gap-0.5 ${
                chartType === 'tasks'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-2.5 h-2.5" />
              مهام
            </button>
            <button
              onClick={() => setChartType('financial')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all flex items-center gap-0.5 ${
                chartType === 'financial'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-2.5 h-2.5" />
              مالي
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'tasks' ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '6px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
              <Area type="monotone" dataKey="منشأ" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#colorCreated)" name="تم إنشاؤه" />
              <Area type="monotone" dataKey="مكتمل" stroke="#22c55e" strokeWidth={1.5} fill="url(#colorCompleted)" name="مكتمل" />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '6px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => `${value.toLocaleString()} ج.م`}
              />
              <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
              <Bar dataKey="قيمة" fill="#8b5cf6" name="القيمة (ج.م)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-500 text-[9px]">متوسط يومي</p>
          <p className="text-white font-semibold text-xs">
            {chartType === 'tasks' ? '16.5' : '17.9K'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[9px]">أعلى قيمة</p>
          <p className="text-white font-semibold text-xs">
            {chartType === 'tasks' ? '22' : '25K'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[9px]">نسبة الإنجاز</p>
          <p className="text-white font-semibold text-xs">82%</p>
        </div>
      </div>
    </motion.div>
  );
}