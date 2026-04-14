'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put(`/users/${user?._id}`, { name: formData.name });
      
      // تحديث بيانات المستخدم في الـ store
      if (user) {
        setAuth(localStorage.getItem('token') || '', {
          ...user,
          name: formData.name
        });
      }
      
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">الإعدادات</h1>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            disabled
          />
          
          <Button type="submit" isLoading={loading}>
            حفظ التغييرات
          </Button>
        </form>
      </Card>
    </div>
  );
}