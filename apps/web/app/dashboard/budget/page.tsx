'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, PieChart,
  Plus, Minus, Edit, Save, AlertCircle, CheckCircle,
  Wallet, Building, Calendar, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface BudgetData {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  projectsCount: number;
  currency: string;
}

interface Project {
  _id: string;
  name: string;
  budget: number;
  spent: number;
  status: string;
  createdAt: string;
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchBudgetData();
    fetchProjects();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const response = await api.get('/company/budget');
      setBudget(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch budget:', error);
      toast.error('فشل في تحميل بيانات الميزانية');
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newTotalBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    try {
      await api.put('/company/budget', { totalBudget: amount });
      toast.success('تم تحديث الميزانية بنجاح');
      fetchBudgetData();
      setIsEditModalOpen(false);
      setNewTotalBudget('');
    } catch (error) {
      toast.error('فشل في تحديث الميزانية');
    }
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  if (loading) return <BudgetSkeleton />;

  const spentPercentage = getPercentage(budget?.spentBudget || 0, budget?.totalBudget || 1);
  const remainingPercentage = getPercentage(budget?.remainingBudget || 0, budget?.totalBudget || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">الميزانية العامة</h1>
          <p className="text-gray-400 mt-1">إدارة ميزانية الشركة وتتبع المصروفات</p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="w-4 h-4 ml-2" />
          تعديل الميزانية
        </Button>
      </div>

      {/* Main Budget Card */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Building className="w-8 h-8 text-purple-400" />
          <h2 className="text-xl font-bold text-white">ميزانية الشركة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">إجمالي الميزانية</p>
            <p className="text-3xl font-bold text-green-400">
              {budget?.totalBudget.toLocaleString()} ج.م
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">المصروف</p>
            <p className="text-3xl font-bold text-orange-400">
              {budget?.spentBudget.toLocaleString()} ج.م
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">المتبقي</p>
            <p className={`text-3xl font-bold ${(budget?.remainingBudget || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {budget?.remainingBudget.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">نسبة الصرف</span>
            <span className="text-purple-400">{Math.round(spentPercentage)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${spentPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-orange-500"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 ج.م</span>
            <span>{Math.round(budget?.totalBudget / 2).toLocaleString()} ج.م</span>
            <span>{budget?.totalBudget.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">ملخص المشاريع</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">عدد المشاريع</span>
              <span className="text-white font-bold">{projects.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">متوسط ميزانية المشروع</span>
              <span className="text-white">
                {projects.length > 0 
                  ? Math.round(projects.reduce((sum, p) => sum + p.budget, 0) / projects.length).toLocaleString()
                  : 0} ج.م
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">أعلى ميزانية مشروع</span>
              <span className="text-green-400">
                {Math.max(...projects.map(p => p.budget), 0).toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">نصائح مالية</h3>
          </div>
          <div className="space-y-3">
            {spentPercentage > 80 ? (
              <div className="flex items-start gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">⚠️ الميزانية تقترب من النفاد! راجع المصروفات</p>
              </div>
            ) : spentPercentage > 50 ? (
              <div className="flex items-start gap-2 text-blue-400">
                <Info className="w-4 h-4 mt-0.5" />
                <p className="text-sm">ℹ️ تم صرف أكثر من نصف الميزانية</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-green-400">
                <CheckCircle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">✅ الميزانية جيدة، استمر في الإدارة الحكيمة</p>
              </div>
            )}
            <div className="flex items-start gap-2 text-gray-400">
              <Wallet className="w-4 h-4 mt-0.5" />
              <p className="text-sm">💡 نصيحة: احتفظ بـ 10-20% من الميزانية كاحتياطي طوارئ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List with Budget */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">توزيع الميزانية على المشاريع</h3>
        </div>
        
        <div className="space-y-4">
          {projects.map((project, index) => (
            <ProjectBudgetItem
              key={project._id}
              project={project}
              totalBudget={budget?.totalBudget || 0}
              onClick={() => setSelectedProject(project)}
            />
          ))}
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              لا توجد مشاريع بعد. ابدأ بإضافة مشروع جديد
            </div>
          )}
        </div>
      </div>

      {/* Edit Budget Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="تعديل الميزانية العامة">
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-sm">📊 الميزانية الحالية</p>
            <p className="text-white text-xl font-bold">{budget?.totalBudget.toLocaleString()} ج.م</p>
          </div>
          
          <Input
            label="الميزانية الجديدة"
            type="number"
            placeholder="أدخل الميزانية الجديدة"
            value={newTotalBudget}
            onChange={(e) => setNewTotalBudget(e.target.value)}
          />
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdateBudget} className="flex-1">
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectBudgetModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function ProjectBudgetItem({ project, totalBudget, onClick }: any) {
  const percentage = (project.budget / totalBudget) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-700/30 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-all"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-white font-semibold">{project.name}</h4>
          <p className="text-gray-400 text-sm">الميزانية: {project.budget.toLocaleString()} ج.م</p>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs ${
          project.status === 'active' ? 'bg-green-500/20 text-green-400' :
          project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {project.status === 'active' ? 'نشط' : project.status === 'completed' ? 'مكتمل' : 'معلق'}
        </span>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">نسبة من الميزانية الكلية</span>
          <span className="text-purple-400">{Math.round(percentage)}%</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

function ProjectBudgetModal({ project, onClose }: any) {
  return (
    <Modal isOpen={true} onClose={onClose} title={`تفاصيل ميزانية ${project.name}`}>
      <div className="space-y-4">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">ميزانية المشروع</span>
            <span className="text-white text-xl font-bold">{project.budget.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">المصروف</span>
            <span className="text-orange-400">{project.spent?.toLocaleString() || 0} ج.م</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">المتبقي</span>
              <span className="text-green-400">
                {((project.budget || 0) - (project.spent || 0)).toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 rounded-xl p-3 text-sm">
          <p className="text-yellow-400">💡 ملاحظة:</p>
          <p className="text-gray-300 text-xs mt-1">
            عند إنشاء مهام جديدة وتحديد تكلفتها، سيتم خصمها من ميزانية المشروع تلقائياً
          </p>
        </div>
      </div>
    </Modal>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-700 rounded-xl w-32"></div>
      </div>
      <div className="h-48 bg-gray-800 rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-gray-800 rounded-2xl"></div>
        <div className="h-48 bg-gray-800 rounded-2xl"></div>
      </div>
    </div>
  );
}

// Import missing icon
import { Info } from 'lucide-react';