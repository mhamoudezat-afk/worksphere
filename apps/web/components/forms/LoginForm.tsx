'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      
      const { token, ...user } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update store
      setAuth(token, user);
      
      toast.success('تم تسجيل الدخول بنجاح', {
        duration: 3000,
        position: 'bottom-center',
        icon: '✅',
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة', {
          duration: 4000,
          position: 'bottom-center',
        });
      } else if (err.code === 'ERR_NETWORK') {
        toast.error('لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت', {
          duration: 5000,
          position: 'bottom-center',
        });
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message, {
          duration: 4000,
          position: 'bottom-center',
        });
      } else {
        toast.error('حدث خطأ غير متوقع. حاول مرة أخرى', {
          duration: 4000,
          position: 'bottom-center',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Mail className="w-5 h-5 text-gray-500" />
          </div>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onBlur={() => validateForm()}
            className={`w-full px-4 py-2.5 pr-10 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
              errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-600 focus:border-transparent'
            }`}
            placeholder="admin@worksphere.com"
            autoComplete="email"
            autoFocus
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          كلمة المرور
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onBlur={() => validateForm()}
            className={`w-full px-4 py-2.5 pr-10 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
              errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-600 focus:border-transparent'
            }`}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-gray-300 transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>جاري تسجيل الدخول...</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>تسجيل الدخول</span>
          </>
        )}
      </button>

      {/* Demo Credentials */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20">
          <p className="text-blue-400 text-sm font-medium mb-2">📋 حساب تجريبي</p>
          <div className="space-y-1 text-xs text-gray-300">
            <p>البريد الإلكتروني: <span className="text-blue-400 font-mono">admin@worksphere.com</span></p>
            <p>كلمة المرور: <span className="text-blue-400 font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    </form>
  );
}