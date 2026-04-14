'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter, Mail, Crown,
  Shield, MoreVertical, Edit, Trash2, Award,
  TrendingUp, CheckCircle, Clock, Star, Trophy,
  Zap, Target, Calendar, MessageSquare, Phone
} from 'lucide-react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  joinedAt: string;
  lastActive: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, roleFilter]);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users');
      const membersWithStats = await Promise.all(response.data.map(async (member: any) => {
        const tasksRes = await api.get(`/tasks?userId=${member._id}`);
        const tasks = tasksRes.data;
        const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
        const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
        
        return {
          ...member,
          totalTasks: tasks.length,
          completedTasks,
          completionRate: Math.round(completionRate),
          lastActive: new Date().toISOString(),
        };
      }));
      setMembers(membersWithStats);
      setFilteredMembers(membersWithStats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      toast.error('فشل في تحميل أعضاء الفريق');
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];
    
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }
    
    setFilteredMembers(filtered);
  };

  const handleInviteMember = async (data: any) => {
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: '123456',
        role: data.role,
      });
      fetchTeamMembers();
      setIsInviteModalOpen(false);
      toast.success('تم إضافة العضو بنجاح');
    } catch (error: any) {
      if (error.response?.data?.message === 'User already exists') {
        toast.error('البريد الإلكتروني موجود بالفعل');
      } else {
        toast.error('فشل في إضافة العضو');
      }
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${memberName}؟`)) return;
    try {
      await api.delete(`/users/${memberId}`);
      setMembers(members.filter(m => m._id !== memberId));
      toast.success('تم إزالة العضو بنجاح');
    } catch (error) {
      toast.error('فشل في إزالة العضو');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await api.put(`/users/${memberId}`, { role: newRole });
      setMembers(members.map(m => m._id === memberId ? { ...m, role: newRole } : m));
      toast.success('تم تحديث الدور بنجاح');
    } catch (error) {
      toast.error('فشل في تحديث الدور');
    }
  };

  const topPerformers = [...members].sort((a, b) => b.completionRate - a.completionRate).slice(0, 3);

  if (loading) return <TeamSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">فريق العمل</h1>
          <p className="text-gray-400 mt-1">إدارة أعضاء فريقك وأدوارهم وإنتاجيتهم</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 ml-2" />
          إضافة عضو
        </Button>
      </div>

      {/* Leaderboard - Top 3 Performers */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold text-lg">أفضل الأعضاء هذا الشهر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformers.map((member, index) => (
            <LeaderboardCard key={member._id} member={member} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن عضو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
        >
          <option value="all">كل الأدوار</option>
          <option value="admin">مدير</option>
          <option value="member">عضو</option>
        </select>
        
        <div className="flex bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Team Members Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => (
            <TeamCard
              key={member._id}
              member={member}
              index={index}
              onUpdateRole={handleUpdateRole}
              onRemove={handleRemoveMember}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member, index) => (
            <TeamListItem
              key={member._id}
              member={member}
              index={index}
              onUpdateRole={handleUpdateRole}
              onRemove={handleRemoveMember}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">لا توجد أعضاء</h3>
          <p className="text-gray-400">ابدأ بإضافة أعضاء جدد إلى فريقك</p>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteMember}
      />

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
}

function LeaderboardCard({ member, rank }: { member: TeamMember; rank: number }) {
  const rankColors = {
    1: 'from-yellow-500 to-orange-500 border-yellow-500/50',
    2: 'from-gray-400 to-gray-500 border-gray-400/50',
    3: 'from-orange-500 to-orange-600 border-orange-500/50',
  };
  
  return (
    <div className={`bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} rounded-xl p-4 text-center`}>
      <div className="relative inline-block mb-3">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto">
          <span className="text-white text-3xl font-bold">{member.name.charAt(0)}</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
          {rank}
        </div>
      </div>
      <h4 className="text-white font-bold text-lg">{member.name}</h4>
      <p className="text-white/80 text-sm mb-2">{member.role === 'admin' ? 'مدير' : 'عضو'}</p>
      <div className="flex justify-center gap-4 text-sm">
        <div>
          <p className="text-white/70">المهام</p>
          <p className="text-white font-bold">{member.totalTasks}</p>
        </div>
        <div>
          <p className="text-white/70">الإنجاز</p>
          <p className="text-white font-bold">{member.completionRate}%</p>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ member, index, onUpdateRole, onRemove, onClick }: any) {
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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={onClick}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{member.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400 text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {member.role === 'admin' ? (
                  <Crown className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Shield className="w-4 h-4 text-blue-400" />
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {member.role === 'admin' ? 'مدير' : 'عضو'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute left-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button onClick={() => { onUpdateRole(member._id, 'admin'); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg flex items-center gap-2">
                  <Crown className="w-3 h-3" /> جعل مدير
                </button>
                <button onClick={() => { onUpdateRole(member._id, 'member'); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> جعل عضو
                </button>
                <hr className="border-gray-700" />
                <button onClick={() => { onRemove(member._id, member.name); setShowMenu(false); }} className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg flex items-center gap-2">
                  <Trash2 className="w-3 h-3" /> إزالة
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div>
              <p className="text-gray-400 text-xs">المهام</p>
              <p className="text-white font-semibold">{member.totalTasks}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">مكتمل</p>
              <p className="text-green-400 font-semibold">{member.completedTasks}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">الإنجاز</p>
              <p className="text-purple-400 font-semibold">{member.completionRate}%</p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${member.completionRate}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeamListItem({ member, index, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold">{member.name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="text-white font-semibold">{member.name}</h4>
            <p className="text-gray-400 text-sm">{member.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-xs">المهام</p>
            <p className="text-white font-semibold">{member.totalTasks}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">الإنجاز</p>
            <p className="text-purple-400 font-semibold">{member.completionRate}%</p>
          </div>
          <div className="w-32">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${member.completionRate}%` }} />
            </div>
          </div>
          <span className={`px-2 py-1 rounded-lg text-xs ${
            member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {member.role === 'admin' ? 'مدير' : 'عضو'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function InviteModal({ isOpen, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'member' });
  
  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('الرجاء إدخال جميع البيانات');
      return;
    }
    onSubmit(formData);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة عضو جديد">
      <div className="space-y-4">
        <Input
          label="الاسم الكامل"
          placeholder="أدخل اسم العضو"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="member@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">الدور</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="member">عضو</option>
            <option value="admin">مدير</option>
          </select>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
          <p className="text-blue-400">📧 سيتم إضافة العضو الجديد</p>
          <p className="text-gray-400 text-xs mt-1">كلمة المرور المؤقتة: 123456</p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">إضافة العضو</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
        </div>
      </div>
    </Modal>
  );
}

function MemberProfileModal({ member, onClose, onUpdateRole }: any) {
  return (
    <Modal isOpen={true} onClose={onClose} title="ملف العضو">
      <div className="text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">{member.name.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-bold text-white">{member.name}</h3>
        <p className="text-gray-400">{member.email}</p>
        <div className="mt-2 flex justify-center gap-2">
          <button className="px-3 py-1 bg-purple-600 rounded-lg text-white text-sm">راسل</button>
          <button className="px-3 py-1 bg-gray-700 rounded-lg text-white text-sm">عرض المهام</button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">الدور</span>
            <div className="flex gap-2">
              <button onClick={() => onUpdateRole(member._id, 'admin')} className={`px-3 py-1 rounded-lg text-sm ${member.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>مدير</button>
              <button onClick={() => onUpdateRole(member._id, 'member')} className={`px-3 py-1 rounded-lg text-sm ${member.role === 'member' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>عضو</button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">الإحصائيات</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">إجمالي المهام</span>
              <span className="text-white">{member.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">المهام المكتملة</span>
              <span className="text-green-400">{member.completedTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">نسبة الإنجاز</span>
              <span className="text-purple-400">{member.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TeamSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-700 rounded-xl w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-800 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-gray-800 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}