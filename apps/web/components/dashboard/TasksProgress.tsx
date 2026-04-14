'use client';

import { motion } from 'framer-motion';
import { Target, Trophy, TrendingUp, Zap } from 'lucide-react';

interface TasksProgressProps {
  progress: number;
  completed?: number;
  total?: number;
  streak?: number;
}

export default function TasksProgress({ progress, completed = 65, total = 100, streak = 7 }: TasksProgressProps) {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const isMilestone = progress >= 75;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-hidden rounded-xl bg-gray-800/30 backdrop-blur-sm p-3 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
            <Target className="w-3.5 h-3.5 text-green-400" />
          </div>
          <h3 className="text-white font-medium text-sm">إنجاز المهام</h3>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
          <Zap className="w-2.5 h-2.5 text-orange-400" />
          <span className="text-orange-400 text-[9px] font-medium">{streak} أيام</span>
        </div>
      </div>
      
      {/* Progress Circle */}
      <div className="flex items-center justify-center gap-4">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              {Math.round(progress)}%
            </motion.p>
            <p className="text-[9px] text-gray-400">مكتمل</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-center">
            <p className="text-gray-500 text-[9px]">مكتمل</p>
            <p className="text-white font-bold text-sm">{completed}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-[9px]">متبقي</p>
            <p className="text-white font-bold text-sm">{total - completed}</p>
          </div>
        </div>
      </div>
      
      {/* Achievement Badge */}
      {isMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 flex items-center justify-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
        >
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400 text-[9px] font-medium">أداء ممتاز! استمر</span>
          <TrendingUp className="w-3 h-3 text-yellow-400" />
        </motion.div>
      )}
    </motion.div>
  );
}