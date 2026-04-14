'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, CheckSquare, 
  Users, Settings, BarChart3, Wallet, DollarSign,
  Receipt, FileText
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية', prefetch: true },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'المشاريع', prefetch: true },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'المهام', prefetch: true },
  { href: '/dashboard/team', icon: Users, label: 'الفريق', prefetch: true },
  { href: '/dashboard/budget', icon: Wallet, label: 'الميزانية', prefetch: true },
  { href: '/dashboard/finance', icon: Receipt, label: 'المصروفات', prefetch: true },
  { href: '/dashboard/salary', icon: DollarSign, label: 'الرواتب', prefetch: true },
  { href: '/dashboard/reports', icon: BarChart3, label: 'التقارير', prefetch: true },
  { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات', prefetch: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-4 border-b border-gray-700 mb-4">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            WorkSphere
          </span>
        </Link>
      </div>
      
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}