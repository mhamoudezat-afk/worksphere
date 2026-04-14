'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export default function TeamPerformance() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  const fetchTeamPerformance = async () => {
    try {
      const response = await api.get('/dashboard/team-performance');
      setMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch team performance:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => b.completionRate - a.completionRate);
  const topPerformers = sortedMembers.slice(0, 3);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold text-lg">أداء الفريق</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>أفضل 3 أعضاء</span>
        </div>
      </div>

      {/* Top Performers Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {topPerformers.map((member, index) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2 border-2 ${
                index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-400' : 'border-orange-400'
              }`}>
                <span className="text-white text-xl font-bold">{member.name.charAt(0)}</span>
              </div>
              {index === 0 && (
                <div className="absolute -top-2 -right-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              )}
            </div>
            <p className="text-white font-medium text-sm">{member.name}</p>
            <p className="text-green-400 text-xs">{member.completionRate}% إنجاز</p>
          </motion.div>
        ))}
      </div>

      {/* Team List */}
      <div className="space-y-3">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-medium">{member.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-gray-400 text-xs">{member.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-gray-400 text-xs">المهام</p>
                <p className="text-white font-semibold">{member.totalTasks}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">مكتمل</p>
                <p className="text-green-400 font-semibold">{member.completedTasks}</p>
              </div>
              <div className="w-24">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">الإنجاز</span>
                  <span className="text-green-400">{member.completionRate}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${member.completionRate}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}