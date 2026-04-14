'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users,
  TrendingUp 
} from 'lucide-react';

interface KPICardsProps {
  kpis?: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    activeTeamMembers: number;
  };
}

const cards = [
  { key: 'totalProjects', label: 'إجمالي المشاريع', icon: FolderKanban, color: 'from-purple-500 to-pink-500' },
  { key: 'totalTasks', label: 'إجمالي المهام', icon: CheckSquare, color: 'from-blue-500 to-cyan-500' },
  { key: 'completedTasks', label: 'المهام المكتملة', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { key: 'overdueTasks', label: 'مهام متأخرة', icon: AlertCircle, color: 'from-red-500 to-orange-500' },
  { key: 'completionRate', label: 'نسبة الإنجاز', icon: Clock, color: 'from-yellow-500 to-orange-500', suffix: '%' },
  { key: 'activeTeamMembers', label: 'أعضاء الفريق', icon: Users, color: 'from-indigo-500 to-purple-500' },
];

export default function KPICards({ kpis }: KPICardsProps) {
  const [counters, setCounters] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!kpis) return;
    
    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;

    Object.entries(kpis).forEach(([key, endValue]) => {
      let current = 0;
      const increment = endValue / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= endValue) {
          setCounters(prev => ({ ...prev, [key]: endValue }));
          clearInterval(timer);
        } else {
          setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, interval);
    });
  }, [kpis]);

  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = counters[card.key] !== undefined ? counters[card.key] : kpis[card.key as keyof typeof kpis];
        
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                {card.label}
              </p>
              
              <p className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {card.suffix || ''}
              </p>
              
              {card.key === 'completionRate' && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}