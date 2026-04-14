'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const routeNames: Record<string, string> = {
  'dashboard': 'لوحة التحكم',
  'projects': 'المشاريع',
  'tasks': 'المهام',
  'team': 'الفريق',
  'settings': 'الإعدادات',
  'pricing': 'الخطط والأسعار',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p && p !== 'dashboard');
  
  if (paths.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm mb-4"
    >
      <Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition flex items-center gap-1">
        <Home className="w-4 h-4" />
        الرئيسية
      </Link>
      
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const href = `/dashboard/${paths.slice(0, index + 1).join('/')}`;
        const name = routeNames[path] || path;
        
        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
            {isLast ? (
              <span className="text-purple-400 font-medium">{name}</span>
            ) : (
              <Link href={href} className="text-gray-400 hover:text-purple-400 transition">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}