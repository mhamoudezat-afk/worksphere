'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  BarChart3, Download, Calendar, Filter, Award,
  Target, AlertCircle, CheckCircle, Clock, Users,
  FileText, Printer, Share2
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import toast from 'react-hot-toast';

interface ReportData {
  kpis: {
    totalBudget: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    activeProjects: number;
  };
  charts: {
    weeklyData: Array<{ day: string; created: number; completed: number }>;
    priorityData: Array<{ name: string; value: number; color: string }>;
    teamData: Array<{ name: string; tasks: number; completed: number }>;
  };
  projects: Array<{ name: string; budget: number; spent: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [activeChart, setActiveChart] = useState<'tasks' | 'priority' | 'team'>('tasks');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      
      const tasks = tasksRes.data;
      const projects = projectsRes.data;
      
      const completed = tasks.filter((t: any) => t.status === 'done').length;
      const overdue = tasks.filter((t: any) => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
      ).length;
      const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
      
      const weeklyData = [
        { day: 'الأحد', created: 12, completed: 8 },
        { day: 'الإثنين', created: 15, completed: 10 },
        { day: 'الثلاثاء', created: 10, completed: 12 },
        { day: 'الأربعاء', created: 18, completed: 14 },
        { day: 'الخميس', created: 14, completed: 11 },
        { day: 'الجمعة', created: 8, completed: 6 },
        { day: 'السبت', created: 5, completed: 4 },
      ];
      
      const priorityData = [
        { name: 'عاجل', value: tasks.filter((t: any) => t.priority === 'urgent').length, color: '#ef4444' },
        { name: 'عالي', value: tasks.filter((t: any) => t.priority === 'high').length, color: '#f97316' },
        { name: 'متوسط', value: tasks.filter((t: any) => t.priority === 'medium').length, color: '#eab308' },
        { name: 'منخفض', value: tasks.filter((t: any) => t.priority === 'low').length, color: '#22c55e' },
      ];
      
      const teamData = [
        { name: 'أحمد', tasks: 24, completed: 18 },
        { name: 'نورا', tasks: 20, completed: 16 },
        { name: 'محمد', tasks: 18, completed: 14 },
        { name: 'سارة', tasks: 15, completed: 12 },
      ];
      
      const projectsData = projects.map((p: any) => ({
        name: p.name,
        budget: p.budget || 0,
        spent: 0
      }));
      
      setData({
        kpis: {
          totalBudget: projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
          totalTasks: tasks.length,
          completedTasks: completed,
          overdueTasks: overdue,
          completionRate: Math.round(completionRate),
          activeProjects: projects.length,
        },
        charts: { weeklyData, priorityData, teamData },
        projects: projectsData
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('فشل في تحميل بيانات التقرير');
      setLoading(false);
    }
  };

  // دالة تصدير التقرير إلى ملف
  const exportToCSV = () => {
    if (!data) return;
    
    // إنشاء محتوى CSV
    const rows = [];
    
    // عنوان التقرير
    rows.push(['تقرير WorkSphere']);
    rows.push([`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`]);
    rows.push([]);
    
    // إحصائيات رئيسية
    rows.push(['📊 الإحصائيات الرئيسية']);
    rows.push(['المؤشر', 'القيمة']);
    rows.push(['إجمالي الميزانية', `${data.kpis.totalBudget.toLocaleString()} ج.م`]);
    rows.push(['إجمالي المهام', data.kpis.totalTasks]);
    rows.push(['المهام المكتملة', data.kpis.completedTasks]);
    rows.push(['المهام المتأخرة', data.kpis.overdueTasks]);
    rows.push(['نسبة الإنجاز', `${data.kpis.completionRate}%`]);
    rows.push(['المشاريع النشطة', data.kpis.activeProjects]);
    rows.push([]);
    
    // توزيع المهام حسب الأولوية
    rows.push(['📋 توزيع المهام حسب الأولوية']);
    rows.push(['الأولوية', 'العدد']);
    data.charts.priorityData.forEach(p => {
      rows.push([p.name, p.value]);
    });
    rows.push([]);
    
    // أداء الفريق
    rows.push(['👥 أداء الفريق']);
    rows.push(['العضو', 'إجمالي المهام', 'المهام المكتملة', 'نسبة الإنجاز']);
    data.charts.teamData.forEach(m => {
      const rate = m.tasks > 0 ? Math.round((m.completed / m.tasks) * 100) : 0;
      rows.push([m.name, m.tasks, m.completed, `${rate}%`]);
    });
    rows.push([]);
    
    // المشاريع
    rows.push(['📁 المشاريع']);
    rows.push(['المشروع', 'الميزانية']);
    data.projects.forEach(p => {
      rows.push([p.name, `${p.budget.toLocaleString()} ج.م`]);
    });
    
    // تحويل إلى CSV
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // إضافة BOM للعربية
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_WorkSphere_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير التقرير بنجاح');
  };

  // دالة تصدير التقرير إلى PDF (طباعة)
  const exportToPDF = () => {
    window.print();
  };

  if (loading) return <ReportsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">التقارير والتحليلات</h1>
          <p className="text-gray-400 mt-1">تحليلات متقدمة لأداء مشاريعك وفريقك</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-800/50 rounded-xl p-1">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
              </button>
            ))}
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 rounded-xl text-white flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-purple-600 rounded-xl text-white flex items-center gap-2 hover:bg-purple-700 transition"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>
      </div>

      {/* باقي محتوى الصفحة كما هو... */}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="إجمالي الميزانية" value={`${data?.kpis.totalBudget.toLocaleString()} ج.م`} icon={DollarSign} color="green" />
        <KPICard title="إجمالي المهام" value={data?.kpis.totalTasks || 0} icon={CheckCircle} color="blue" />
        <KPICard title="نسبة الإنجاز" value={`${data?.kpis.completionRate}%`} icon={Target} color="purple" />
      </div>

      {/* Chart Selector */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {[
          { id: 'tasks', label: 'أداء المهام', icon: BarChart3 },
          { id: 'priority', label: 'توزيع الأولويات', icon: PieChart },
          { id: 'team', label: 'إنتاجية الفريق', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeChart === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'tasks' && data?.charts.weeklyData && (
              <AreaChart data={data.charts.weeklyData}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="created" stroke="#8b5cf6" fill="url(#colorCreated)" name="تم إنشاؤه" />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#colorCompleted)" name="مكتمل" />
              </AreaChart>
            )}
            {activeChart === 'priority' && data?.charts.priorityData && (
              <PieChart>
                <Pie
                  data={data.charts.priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.charts.priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            )}
            {activeChart === 'team' && data?.charts.teamData && (
              <BarChart data={data.charts.teamData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="tasks" fill="#8b5cf6" name="إجمالي" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#22c55e" name="مكتمل" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">قائمة المشاريع</h3>
        <div className="space-y-3">
          {data?.projects.map((project, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
              <span className="text-white">{project.name}</span>
              <span className="text-green-400">{project.budget.toLocaleString()} ج.م</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }: any) {
  const colors = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 border`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-white opacity-70" />
      </div>
      <p className="text-gray-300 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </motion.div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-700 rounded-xl w-32"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
        ))}
      </div>
      <div className="h-96 bg-gray-800 rounded-2xl"></div>
    </div>
  );
}