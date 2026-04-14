'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Calendar, Users, CheckCircle, Clock, AlertCircle,
  BarChart3, TrendingUp, Edit, Trash2, Plus, DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import TaskForm from '@/components/forms/TaskForm';
import toast from 'react-hot-toast';

interface ProjectDetailsProps {
  project: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProjectDetails({ project, onClose, onUpdate }: ProjectDetailsProps) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'analytics'>('overview');

  useEffect(() => {
    fetchProjectTasks();
  }, [project._id]);

  const fetchProjectTasks = async () => {
    try {
      const response = await api.get(`/tasks?projectId=${project._id}`);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const handleAddTask = async (data: any) => {
    try {
      await api.post('/tasks', { ...data, projectId: project._id });
      fetchProjectTasks();
      setIsTaskModalOpen(false);
      onUpdate();
      toast.success('تم إضافة المهمة بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة المهمة');
    }
  };

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t: any) => t.status === 'done').length,
    inProgressTasks: tasks.filter((t: any) => t.status === 'in-progress').length,
    overdueTasks: tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    progress: tasks.length > 0 ? (tasks.filter((t: any) => t.status === 'done').length / tasks.length) * 100 : 0,
  };

  const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

  return (
    <Modal isOpen={true} onClose={onClose} title="">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Project Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
              <p className="text-gray-400 mt-1">{project.description || 'لا يوجد وصف'}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>تاريخ البدء: {project.startDate ? new Date(project.startDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>تاريخ الانتهاء: {new Date(project.endDate).toLocaleDateString('ar-EG')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>الميزانية: {project.budget?.toLocaleString() || 0} ج.م</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>{project.members?.length || 0} أعضاء</span>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        {project.budget > 0 && (
          <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">استخدام الميزانية</span>
              <span className="text-purple-400">{Math.round(budgetUsed)}%</span>
            </div>
            <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-orange-500" style={{ width: `${Math.min(100, budgetUsed)}%` }} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700 mb-6">
          {['overview', 'tasks', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && 'نظرة عامة'}
              {tab === 'tasks' && 'المهام'}
              {tab === 'analytics' && 'التحليلات'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">المهام المكتملة</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.completedTasks}/{stats.totalTasks}</p>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">قيد التنفيذ</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.inProgressTasks}</p>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400 text-sm">مهام متأخرة</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.overdueTasks}</p>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">نسبة الإنجاز</span>
                </div>
                <p className="text-2xl font-bold text-white">{Math.round(stats.progress)}%</p>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">تقدم المشروع</h3>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-gray-700/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">أعضاء الفريق</h3>
              <div className="space-y-3">
                {project.members?.length > 0 ? (
                  project.members.map((member: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                        {member.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.role || 'عضو'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">لا يوجد أعضاء في هذا المشروع</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">قائمة المهام</h3>
              <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة مهمة
              </Button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                لا توجد مهام في هذا المشروع
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task: any, i: number) => (
                  <div key={i} className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-white">{task.title}</p>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status === 'done' ? 'مكتمل' : task.status === 'in-progress' ? 'قيد التنفيذ' : 'قائمة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">توزيع المهام</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">مكتمل</span>
                    <span className="text-green-400">{stats.completedTasks}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">قيد التنفيذ</span>
                    <span className="text-blue-400">{stats.inProgressTasks}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">متأخر</span>
                    <span className="text-red-400">{stats.overdueTasks}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.overdueTasks / stats.totalTasks) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="إضافة مهمة جديدة">
        <TaskForm
          projects={[project]}
          onSubmit={handleAddTask}
          onCancel={() => setIsTaskModalOpen(false)}
        />
      </Modal>
    </Modal>
  );
}