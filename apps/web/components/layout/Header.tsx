'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Settings, LayoutDashboard, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout(); // حذف التوكن والبيانات
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          WorkSphere
        </h1>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-700 transition">
            <Bell className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-white hidden md:inline">{user?.name}</span>
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/dashboard');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 transition"
                >
                  <Settings className="w-4 h-4" />
                  الإعدادات
                </button>
                
                <hr className="border-gray-700" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}