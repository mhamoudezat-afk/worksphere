'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

const glows = {
  purple: 'shadow-purple-500/20',
  green: 'shadow-green-500/20',
  red: 'shadow-red-500/20',
  blue: 'shadow-blue-500/20',
};

const iconBgs = {
  purple: 'bg-purple-500/20',
  green: 'bg-green-500/20',
  red: 'bg-red-500/20',
  blue: 'bg-blue-500/20',
};

export default function StatsCard({ title, value, prefix = '', suffix = '', change = 0, icon: Icon, color }: StatsCardProps) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradients[color]} p-5 border backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${borders[color]} ${glows[color]}`}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${iconBgs[color]} backdrop-blur-sm border ${borders[color]}`}>
            <Icon className={`w-5 h-5 ${color === 'purple' ? 'text-purple-400' : color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-sm text-gray-500">{prefix}</span>}
          <span className="text-2xl font-bold text-white tracking-tight">
            {value.toLocaleString()}
          </span>
          {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
}