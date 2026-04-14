'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, Edit, Trash2, 
  DollarSign, Calendar, Users, AlertCircle,
  TrendingUp, TrendingDown, MoreVertical, Grid3x3, LayoutList
} from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/forms/ProjectForm';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  members: Array<{ _id: string; name: string }>;
  progress: number;
  tasksCount: number;
  completedTasks: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const projectsWithStats = await Promise.all(response.data.map(async (project: any) => {
        try {
          const tasksRes = await api.get(`/tasks?projectId=${project._id}`);
          const tasks = tasksRes.data || [];
          const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
          const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
          
          return {
            ...project,
            spent: 0,
            progress: Math.round(progress),
            tasksCount: tasks.length,
            completedTasks,
            members: project.members?.map((m: any) => ({ _id: m, name: 'عضو' })) || []
          };
        } catch {
          return {
            ...project,
            spent: 0,
            progress: 0,
            tasksCount: 0,
            completedTasks: 0,
            members: []
          };
        }
      }));
      setProjects(projectsWithStats);
      setFilteredProjects(projectsWithStats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('فشل في تحميل المشاريع');
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (data: any) => {
    try {
      const response = await api.post('/projects', data);
      setProjects([response.data, ...projects]);
      setIsModalOpen(false);
      toast.success('تم إنشاء المشروع بنجاح');
      fetchProjects();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('فشل في إنشاء المشروع');
      }
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!editingProject) return;
    try {
      const response = await api.put(`/projects/${editingProject._id}`, data);
      setProjects(projects.map(p => p._id === editingProject._id ? response.data : p));
      setEditingProject(null);
      toast.success('تم تحديث المشروع بنجاح');
      fetchProjects();
    } catch (error) {
      toast.error('فشل في تحديث المشروع');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('تم حذف المشروع بنجاح');
    } catch (error) {
      toast.error('فشل في حذف المشروع');
    }
  };

  const getTotalBudget = () => projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const getTotalSpent = () => projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const getRemainingBudget = () => getTotalBudget() - getTotalSpent();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-700 rounded-xl w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">المشاريع</h1>
          <p className="text-gray-400 mt-1">إدارة جميع مشاريعك مع الميزانيات وأعضاء الفريق</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          مشروع جديد
        </Button>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">إجمالي الميزانية</p>
              <p className="text-2xl font-bold text-green-400">{getTotalBudget().toLocaleString()} ج.م</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">إجمالي المصروف</p>
              <p className="text-2xl font-bold text-orange-400">{getTotalSpent().toLocaleString()} ج.م</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">المتبقي</p>
              <p className={`text-2xl font-bold ${getRemainingBudget() >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {getRemainingBudget().toLocaleString()} ج.م
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن مشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            <LayoutList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">لا توجد مشاريع</h3>
          <p className="text-gray-400 mb-4">ابدأ بإضافة مشروع جديد مع تحديد الميزانية والأعضاء</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            أضف مشروعك الأول
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              index={index}
              onDelete={() => handleDeleteProject(project._id)}
              onEdit={() => setEditingProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project, index) => (
            <ProjectListItem
              key={project._id}
              project={project}
              index={index}
              onDelete={() => handleDeleteProject(project._id)}
              onEdit={() => setEditingProject(project)}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء مشروع جديد">
        <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* Edit Project Modal */}
      {editingProject && (
        <Modal isOpen={true} onClose={() => setEditingProject(null)} title="تعديل المشروع">
          <ProjectForm
            initialData={editingProject}
            onSubmit={handleUpdateProject}
            onCancel={() => setEditingProject(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function ProjectCard({ project, index, onDelete, onEdit }: any) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description || 'لا يوجد وصف'}</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute left-0 mt-2 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg flex items-center gap-2">
                  <Edit className="w-3 h-3" /> تعديل
                </button>
                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg flex items-center gap-2">
                  <Trash2 className="w-3 h-3" /> حذف
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <span className={`px-2 py-1 rounded-lg text-xs ${
            project.priority === 'high' ? 'bg-red-500/20 text-red-400' :
            project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {project.priority === 'high' ? 'عالي' : project.priority === 'medium' ? 'متوسط' : 'منخفض'}
          </span>
          <span className={`px-2 py-1 rounded-lg text-xs ${
            project.status === 'active' ? 'bg-green-500/20 text-green-400' :
            project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {project.status === 'active' ? 'نشط' : project.status === 'completed' ? 'مكتمل' : 'معلق'}
          </span>
        </div>

        {/* Budget Info */}
        <div className="bg-gray-700/30 rounded-xl p-3 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">الميزانية</span>
            <span className="text-white">{project.budget.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">نسبة الإنجاز</span>
            <span className="text-purple-400">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden mt-2">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{project.members?.length || 0} أعضاء</span>
          </div>
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((member: any, i: number) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium border-2 border-gray-800"
                title={member.name}
              >
                {member.name?.charAt(0) || '?'}
              </div>
            ))}
            {project.members?.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium border-2 border-gray-800">
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectListItem({ project, index, onDelete, onEdit }: any) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-white font-semibold">{project.name}</h4>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${
              project.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {project.priority === 'high' ? 'عالي' : project.priority === 'medium' ? 'متوسط' : 'منخفض'}
            </span>
          </div>
          <p className="text-gray-400 text-sm truncate">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-gray-400">الميزانية: </span>
            <span className="text-white">{project.budget.toLocaleString()} ج.م</span>
          </div>
          
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">الإنجاز</span>
              <span className="text-purple-400">{project.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((member: any, i: number) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium border-2 border-gray-800">
                {member.name?.charAt(0) || '?'}
              </div>
            ))}
          </div>
          
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute left-0 mt-2 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg flex items-center gap-2">
                  <Edit className="w-3 h-3" /> تعديل
                </button>
                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg flex items-center gap-2">
                  <Trash2 className="w-3 h-3" /> حذف
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}