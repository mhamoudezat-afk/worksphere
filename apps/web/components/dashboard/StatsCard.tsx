'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: any;
  color: 'purple' | 'green' | 'red' | 'blue';
}

const gradients = {
  purple: 'from-purple-600/20 to-purple-800/20',
  green: 'from-green-600/20 to-green-800/20',
  red: 'from-red-600/20 to-red-800/20',
  blue: 'from-blue-600/20 to-blue-800/20',
};

const borders = {
  purple: 'border-purple-500/30',
  green: 'border-green-500/30',
  red: 'border-red-500/30',
  blue: 'border-blue-500/30',
};

const iconBgs = {
  purple: 'bg-purple-500/20',
  green: 'bg-green-500/20',
  red: 'bg-red-500/20',
  blue: 'bg-blue-500/20',
};

const textColors = {
  purple: 'text-purple-400',
  green: 'text-green-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
};

export default function StatsCard({ title, value, prefix = '', suffix = '', change = 0, icon: Icon, color }: StatsCardProps) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradients[color]} p-3 border backdrop-blur-xl ${borders[color]}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 rounded-lg ${iconBgs[color]} backdrop-blur-sm border ${borders[color]}`}>
            <Icon className={`w-4 h-4 ${textColors[color]}`} />
          </div>
          {change !== 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span>{Math.abs(change)}%</span>
            </motion.div>
          )}
        </div>
        
        <p className="text-gray-400 text-[10px] mb-0.5">{title}</p>
        <div className="flex items-baseline gap-0.5">
          {prefix && <span className="text-[10px] text-gray-500">{prefix}</span>}
          <span className={`text-base font-bold tracking-tight ${textColors[color]}`}>
            <AnimatedNumber value={value} />
          </span>
          {suffix && <span className="text-[10px] text-gray-500">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
}