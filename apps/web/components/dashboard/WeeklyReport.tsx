'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Download, Share2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReportData {
  weekRange: string;
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number;
  topPerformer: string;
  mostActiveDay: string;
}

export default function WeeklyReport() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      const tasksRes = await api.get('/tasks');
      const tasks = tasksRes.data;
      
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      
      const weekTasks = tasks.filter((task: any) => 
        new Date(task.createdAt) >= weekAgo
      );
      
      const completedTasks = weekTasks.filter((t: any) => t.status === 'done');
      
      const dayActivity = new Array(7).fill(0);
      weekTasks.forEach((task: any) => {
        const day = new Date(task.createdAt).getDay();
        dayActivity[day]++;
      });
      
      const mostActiveDayIndex = dayActivity.indexOf(Math.max(...dayActivity));
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      setReport({
        weekRange: `${weekAgo.toLocaleDateString('ar-EG')} - ${today.toLocaleDateString('ar-EG')}`,
        tasksCreated: weekTasks.length,
        tasksCompleted: completedTasks.length,
        completionRate: weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0,
        topPerformer: 'أنت! 🎉',
        mostActiveDay: days[mostActiveDayIndex],
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const content = `
تقرير الأسبوعي - WorkSphere
${report.weekRange}

📊 إحصائيات الأسبوع:
• المهام المنشأة: ${report.tasksCreated}
• المهام المكتملة: ${report.tasksCompleted}
• نسبة الإنجاز: ${Math.round(report.completionRate)}%
• أكثر يوم نشاط: ${report.mostActiveDay}
• أفضل عضو: ${report.topPerformer}

تم إنشاء التقرير بواسطة WorkSphere
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تحميل التقرير');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`تقرير أسبوعي: ${Math.round(report?.completionRate || 0)}% إنجاز في WorkSphere`);
    toast.success('تم نسخ التقرير للحافظة');
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">التقرير الأسبوعي</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title="تحميل التقرير"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title="مشاركة التقرير"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">{report?.weekRange}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{Math.round(report?.completionRate || 0)}%</span>
            <span className="text-gray-400">نسبة الإنجاز</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700/30 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-sm">المهام المنشأة</p>
            <p className="text-2xl font-bold text-purple-400">{report?.tasksCreated}</p>
          </div>
          <div className="bg-gray-700/30 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-sm">المهام المكتملة</p>
            <p className="text-2xl font-bold text-green-400">{report?.tasksCompleted}</p>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">أكثر يوم نشاط</p>
              <p className="text-white font-semibold">{report?.mostActiveDay}</p>
            </div>
            <div className="text-left">
              <p className="text-gray-400 text-sm">أفضل عضو</p>
              <p className="text-white font-semibold">{report?.topPerformer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}