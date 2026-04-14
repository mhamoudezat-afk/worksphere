'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  Area, AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Calendar, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface ChartData {
  weeklyData: Array<{ day: string; completed: number; created: number }>;
  priorityData: Array<{ name: string; value: number }>;
  productivityData: Array<{ name: string; tasks: number; completed: number }>;
}

const COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function AnalyticsCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'weekly' | 'priority' | 'productivity'>('weekly');

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await api.get('/dashboard/charts');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold text-lg">التحليلات والإحصائيات</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('weekly')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'weekly'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline ml-1" />
            أسبوعي
          </button>
          <button
            onClick={() => setActiveChart('priority')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'priority'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <PieChartIcon className="w-4 h-4 inline ml-1" />
            الأولويات
          </button>
          <button
            onClick={() => setActiveChart('productivity')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'productivity'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline ml-1" />
            الإنتاجية
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'weekly' && data?.weeklyData && (
            <AreaChart data={data.weeklyData}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="created" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCreated)" name="تم إنشاؤه" />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#colorCompleted)" name="مكتمل" />
            </AreaChart>
          )}
          
          {activeChart === 'priority' && data?.priorityData && (
            <PieChart>
              <Pie
                data={data.priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          )}
          
          {activeChart === 'productivity' && data?.productivityData && (
            <BarChart data={data.productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="tasks" fill="#8b5cf6" name="إجمالي المهام" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completed" fill="#22c55e" name="مكتمل" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}