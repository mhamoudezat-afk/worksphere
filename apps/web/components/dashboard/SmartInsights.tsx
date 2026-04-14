'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Award, Zap, CheckCircle } from 'lucide-react';

interface SmartInsightsProps {
  insights?: {
    behindSchedule: Array<{ projectName: string; daysLate: number }>;
    urgentTasks: Array<{ title: string; dueDate: string }>;
    topPerformers: Array<{ name: string; completedTasks: number }>;
  };
}

export default function SmartInsights({ insights }: SmartInsightsProps) {
  if (!insights) return null;

  return (
    <div className="space-y-4">
      {/* Behind Schedule */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl p-4 border border-red-500/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold">مشاريع متأخرة</h3>
        </div>
        
        {insights.behindSchedule.length === 0 ? (
          <p className="text-gray-400 text-sm">🎉 كل المشاريع في الموعد المحدد!</p>
        ) : (
          <div className="space-y-2">
            {insights.behindSchedule.map((project, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{project.projectName}</span>
                <span className="text-red-400 text-sm font-medium">
                  متأخر {project.daysLate} يوم
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Urgent Tasks */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-4 border border-orange-500/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-orange-400" />
          <h3 className="text-white font-semibold">مهام عاجلة</h3>
        </div>
        
        {insights.urgentTasks.length === 0 ? (
          <p className="text-gray-400 text-sm">✨ لا توجد مهام عاجلة!</p>
        ) : (
          <div className="space-y-2">
            {insights.urgentTasks.slice(0, 3).map((task, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{task.title}</span>
                <span className="text-orange-400 text-sm">
                  {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-4 border border-green-500/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">أفضل الأعضاء</h3>
        </div>
        
        <div className="space-y-2">
          {insights.topPerformers.map((performer, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-gray-300 text-sm">{performer.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-sm">{performer.completedTasks}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}