'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Users, Calendar, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/forms/ProjectForm';
import TaskForm from '@/components/forms/TaskForm';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function QuickActions() {
  const router = useRouter();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleCreateProject = async (data: any) => {
    try {
      await api.post('/projects', data);
      setIsProjectModalOpen(false);
      toast.success('تم إنشاء المشروع بنجاح');
      window.location.reload();
    } catch (error) {
      toast.error('فشل في إنشاء المشروع');
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      await api.post('/tasks', data);
      setIsTaskModalOpen(false);
      toast.success('تم إنشاء المهمة بنجاح');
      window.location.reload();
    } catch (error) {
      toast.error('فشل في إنشاء المهمة');
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">إجراءات سريعة</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-gray-700/50 rounded-xl p-4 text-center hover:bg-gray-700 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm">مشروع جديد</p>
          </button>
          
          <button
            onClick={async () => { await fetchProjects(); setIsTaskModalOpen(true); }}
            className="bg-gray-700/50 rounded-xl p-4 text-center hover:bg-gray-700 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm">مهمة جديدة</p>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/team')}
            className="bg-gray-700/50 rounded-xl p-4 text-center hover:bg-gray-700 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm">إضافة عضو</p>
          </button>
          
          <button
            onClick={() => toast.success('سيتم إضافة ميزة التقويم قريباً!')}
            className="bg-gray-700/50 rounded-xl p-4 text-center hover:bg-gray-700 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm">جدولة</p>
          </button>
        </div>
      </div>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="إنشاء مشروع جديد">
        <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsProjectModalOpen(false)} />
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="إنشاء مهمة جديدة">
        <TaskForm
          projects={projects}
          onSubmit={handleCreateTask}
          onCancel={() => setIsTaskModalOpen(false)}
        />
      </Modal>
    </>
  );
}