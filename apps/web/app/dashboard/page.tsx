'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import {
  TrendingUp, TrendingDown, Wallet, DollarSign,
  Briefcase, CheckCircle, Calendar, Users,
  Target, Zap, Activity, PieChart, Award, Clock
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import BudgetWidget from '@/components/dashboard/BudgetWidget';
import TasksProgress from '@/components/dashboard/TasksProgress';
import SmartAlerts from '@/components/dashboard/SmartAlerts';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalBudget: number;
  totalExpenses: number;
  totalProjects: number;
  completedTasks: number;
  totalTasks: number;
  budgetUsage: number;
  tasksProgress: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    totalExpenses: 0,
    totalProjects: 0,
    completedTasks: 0,
    totalTasks: 0,
    budgetUsage: 0,
    tasksProgress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      
      const tasks = tasksRes.data || [];
      const projects = projectsRes.data || [];
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
      const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
      const totalSpent = projects.reduce((sum: number, p: any) => sum + (p.spent || 0), 0);
      const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      setStats({
        totalBudget,
        totalExpenses: totalSpent,
        totalProjects: projects.length,
        completedTasks,
        totalTasks,
        budgetUsage,
        tasksProgress
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const recentActivities = [
    { id: '1', user: user?.name || 'Admin', action: 'completed_task', target: 'تسجيل الدخول', time: new Date().toLocaleTimeString('ar-EG'), timeAgo: 'منذ 5 دقائق' },
    { id: '2', user: user?.name || 'Admin', action: 'created_project', target: 'مشروع جديد', time: new Date().toLocaleTimeString('ar-EG'), timeAgo: 'منذ ساعة' },
    { id: '3', user: user?.name || 'Admin', action: 'added_member', target: 'عضو جديد', time: new Date().toLocaleTimeString('ar-EG'), timeAgo: 'منذ 3 ساعات' },
  ];

  const alerts = [
    { id: '1', type: 'warning' as const, title: 'مهام متأخرة', message: '⚠️ 3 مهام متأخرة تحتاج اهتمام', time: new Date().toLocaleTimeString('ar-EG') },
    { id: '2', type: 'info' as const, title: 'إنجاز المهام', message: `📊 تم إنجاز ${Math.round(stats.tasksProgress)}% من المهام`, time: new Date().toLocaleTimeString('ar-EG') },
    { id: '3', type: 'success' as const, title: 'مكتمل', message: `✅ ${stats.completedTasks} مهمة مكتملة هذا الأسبوع`, time: new Date().toLocaleTimeString('ar-EG') },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-3">
      {/* Welcome Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            مرحباً، {user?.name}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3 h-3 text-gray-500" />
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl px-3 py-2 text-center border border-green-500/30">
            <p className="text-gray-300 text-xs">نسبة الإنجاز</p>
            <div className="flex items-center gap-1 justify-center">
              <span className="text-lg font-bold text-green-400">{Math.round(stats.tasksProgress)}%</span>
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl px-3 py-2 text-center border border-orange-500/30">
            <p className="text-gray-300 text-xs">المهام المتبقية</p>
            <p className="text-lg font-bold text-orange-400">{stats.totalTasks - stats.completedTasks}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="إجمالي الميزانية"
          value={stats.totalBudget}
          prefix="ج.م"
          change={12.5}
          icon={Wallet}
          color="purple"
        />
        <StatsCard
          title="المصروفات"
          value={stats.totalExpenses}
          prefix="ج.م"
          change={-5.2}
          icon={DollarSign}
          color="red"
        />
        <StatsCard
          title="المشاريع النشطة"
          value={stats.totalProjects}
          change={8.3}
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          title="المهام المكتملة"
          value={stats.completedTasks}
          suffix={`/ ${stats.totalTasks}`}
          change={15.7}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Main Content Row - Chart + Widgets */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div className="space-y-3">
          <BudgetWidget usage={stats.budgetUsage} />
          <TasksProgress progress={stats.tasksProgress} />
        </div>
      </div>

      {/* Bottom Section - Activity + Alerts */}
      <div className="grid lg:grid-cols-2 gap-3">
        <ActivityFeed activities={recentActivities} />
        <SmartAlerts alerts={alerts} onDismiss={(id) => console.log('Dismissed:', id)} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-64"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-16 bg-gray-700 rounded-xl w-24"></div>
          <div className="h-16 bg-gray-700 rounded-xl w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-800/30 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 h-80 bg-gray-800/30 rounded-xl" />
        <div className="space-y-3">
          <div className="h-44 bg-gray-800/30 rounded-xl" />
          <div className="h-44 bg-gray-800/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
}