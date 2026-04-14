'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, PlusCircle, UserPlus, FolderPlus, Clock, Filter } from 'lucide-react';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  timeAgo: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const actionConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  completed_task: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'أكمل مهمة' },
  created_task: { icon: PlusCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'أنشأ مهمة' },
  created_project: { icon: FolderPlus, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'أنشأ مشروع' },
  added_member: { icon: UserPlus, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'أضاف عضو' },
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  
  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.action === filter);
  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 3);
  const actionTypes = ['all', 'completed_task', 'created_task', 'created_project', 'added_member'];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-hidden rounded-xl bg-gray-800/30 backdrop-blur-sm p-3 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h3 className="text-white font-medium text-sm">النشاطات الأخيرة</h3>
        </div>
        
        {/* Filter */}
        <div className="flex gap-0.5">
          {actionTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${
                filter === type
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'الكل' : 
               type === 'completed_task' ? 'مكتمل' :
               type === 'created_task' ? 'منشأ' :
               type === 'created_project' ? 'مشاريع' : 'أعضاء'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500" />
        
        <div className="space-y-3">
          {displayedActivities.map((activity, index) => {
            const config = actionConfig[activity.action] || actionConfig.created_task;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-2"
              >
                <div className="absolute right-6 top-3 w-1.5 h-1.5 rounded-full bg-purple-500 border border-gray-800" />
                
                <div className="flex-1 pr-8">
                  <div className={`flex items-start gap-2 p-2 rounded-lg ${config.bg} border border-white/5`}>
                    <div className={`p-1 rounded-lg ${config.bg}`}>
                      <Icon className={`w-3 h-3 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-white text-[10px] font-medium">{activity.user}</span>
                        <span className="text-gray-400 text-[9px]">{config.label}</span>
                        <span className="text-purple-400 text-[9px]">"{activity.target}"</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-2 h-2 text-gray-500" />
                        <span className="text-gray-500 text-[8px]">{activity.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Show More */}
      {filteredActivities.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-1 text-center text-purple-400 text-[9px] hover:text-purple-300 transition border-t border-gray-700 pt-2"
        >
          {showAll ? 'عرض أقل' : `عرض ${filteredActivities.length - 3} أكثر`}
        </button>
      )}
    </motion.div>
  );
}