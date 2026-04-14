'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login response:', response.data);
      
      const { token, ...user } = response.data;
      
      // حفظ البيانات
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // تحديث store
      setAuth(token, user);
      
      toast.success('تم تسجيل الدخول بنجاح');
      
      // التوجيه إلى dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (err.code === 'ERR_NETWORK') {
        toast.error('لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم على port 5001');
      } else {
        toast.error(err.response?.data?.message || 'حدث خطأ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="ahmed@test.com"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          كلمة المرور
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••••"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
      >
        {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
      </button>
      
      <div className="text-center text-sm text-gray-400">
        حساب تجريبي: ahmed@test.com / 123456
      </div>
    </form>
  );
}