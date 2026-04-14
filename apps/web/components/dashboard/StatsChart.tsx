'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

interface StatsChartProps {
  tasks: any[];
}

const COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  todo: '#6b7280',
  inProgress: '#3b82f6',
  review: '#8b5cf6',
  done: '#22c55e',
};

export default function StatsChart({ tasks }: StatsChartProps) {
  // بيانات المهام حسب الأولوية
  const priorityData = useMemo(() => {
    const priorities = { urgent: 0, high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      if (priorities[task.priority as keyof typeof priorities] !== undefined) {
        priorities[task.priority as keyof typeof priorities]++;
      }
    });
    return Object.entries(priorities).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // بيانات المهام حسب الحالة
  const statusData = useMemo(() => {
    const statuses = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    tasks.forEach(task => {
      if (statuses[task.status as keyof typeof statuses] !== undefined) {
        statuses[task.status as keyof typeof statuses]++;
      }
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // بيانات الأداء الأسبوعي
  const weeklyData = useMemo(() => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const completed = new Array(7).fill(0);
    const created = new Array(7).fill(0);
    
    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      const dayIndex = createdDate.getDay();
      created[dayIndex]++;
      
      if (task.status === 'done' && task.updatedAt) {
        const completedDate = new Date(task.updatedAt);
        const completedDayIndex = completedDate.getDay();
        completed[completedDayIndex]++;
      }
    });
    
    return days.map((day, i) => ({
      day,
      مكتمل: completed[i],
      منشأ: created[i],
    }));
  }, [tasks]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Pie Chart - Task Distribution */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4 text-lg">توزيع المهام حسب الأولوية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart - Status Distribution */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4 text-lg">حالة المهام</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Line Chart - Weekly Performance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4 text-lg">أداء المهام الأسبوعي</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="منشأ" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            <Line type="monotone" dataKey="مكتمل" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}