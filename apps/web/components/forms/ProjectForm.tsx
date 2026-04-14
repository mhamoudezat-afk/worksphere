'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { DollarSign, AlertCircle, Users, Plus, X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ProjectFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    budget: initialData?.budget || '',
    startDate: initialData?.startDate?.split('T')[0] || '',
    endDate: initialData?.endDate?.split('T')[0] || '',
    members: initialData?.members?.map((m: any) => m._id) || [],
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');

  // جلب أعضاء الفريق
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users');
      setTeamMembers(response.data);
      
      // الأعضاء غير المضافين للمشروع
      const available = response.data.filter(
        (member: TeamMember) => !formData.members.includes(member._id)
      );
      setAvailableMembers(available);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const handleAddMember = () => {
    if (!selectedMember) {
      toast.error('الرجاء اختيار عضو');
      return;
    }
    
    if (!formData.members.includes(selectedMember)) {
      setFormData({
        ...formData,
        members: [...formData.members, selectedMember]
      });
      setSelectedMember('');
      setShowMemberSelector(false);
      toast.success('تم إضافة العضو للمشروع');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData({
      ...formData,
      members: formData.members.filter(id => id !== memberId)
    });
    toast.success('تم إزالة العضو من المشروع');
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find(m => m._id === memberId);
    return member?.name || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('الرجاء إدخال اسم المشروع');
      return;
    }
    
    onSubmit({
      ...formData,
      budget: parseFloat(formData.budget) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <Input
        label="اسم المشروع"
        placeholder="أدخل اسم المشروع"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <Input
        label="وصف المشروع"
        placeholder="وصف المشروع"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">الأولوية</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="low">🟢 منخفضة</option>
          <option value="medium">🟡 متوسطة</option>
          <option value="high">🟠 عالية</option>
        </select>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ميزانية المشروع (جنية مصري)
        </label>
        <div className="relative">
          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0.00"
            step="1000"
          />
        </div>
        <p className="text-gray-500 text-xs mt-1">سيتم خصم هذه الميزانية من الميزانية العامة للشركة</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="تاريخ البدء"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
        
        <Input
          label="تاريخ الانتهاء"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
      </div>

      {/* أعضاء الفريق */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Users className="w-4 h-4 inline ml-1" />
          أعضاء الفريق في هذا المشروع
        </label>
        
        {/* عرض الأعضاء المضافين */}
        <div className="mb-3 space-y-2">
          {formData.members.length === 0 ? (
            <div className="text-center py-3 bg-gray-700/30 rounded-lg text-gray-400 text-sm">
              لا يوجد أعضاء في هذا المشروع
            </div>
          ) : (
            formData.members.map((memberId) => (
              <div key={memberId} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {getMemberName(memberId).charAt(0)}
                  </div>
                  <span className="text-white text-sm">{getMemberName(memberId)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(memberId)}
                  className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* إضافة عضو جديد */}
        {!showMemberSelector ? (
          <button
            type="button"
            onClick={() => setShowMemberSelector(true)}
            className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:border-purple-500 hover:text-purple-400 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة عضو للمشروع
          </button>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">اختر عضو...</option>
              {availableMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} - {member.email}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddMember}
                className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition"
              >
                إضافة
              </button>
              <button
                type="button"
                onClick={() => setShowMemberSelector(false)}
                className="flex-1 py-2 bg-gray-700 rounded-lg text-gray-400 text-sm hover:bg-gray-600 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit">
          {initialData ? 'تحديث المشروع' : 'إنشاء مشروع'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}