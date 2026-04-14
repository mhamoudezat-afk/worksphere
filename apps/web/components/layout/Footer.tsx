'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout(); // حذف التوكن والبيانات من localStorage
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">WorkSphere</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">{user?.name}</span>
          </button>
          
          {showDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/dashboard');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة التحكم
              </button>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/dashboard/settings');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
                الإعدادات
              </button>
              
              <hr className="border-gray-700" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}