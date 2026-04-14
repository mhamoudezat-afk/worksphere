'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Activity, PlusCircle, CheckCircle, MessageCircle, UserPlus, FolderPlus } from 'lucide-react';
import axios from 'axios';

interface Activity {
  id: string;
  userName: string;
  action: string;
  targetName: string;
  createdAt: string;
}

const actionIcons: Record<string, any> = {
  created_task: { icon: PlusCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  completed_task: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  commented_task: { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  created_project: { icon: FolderPlus, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  added_member: { icon: UserPlus, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
};

const actionText: Record<string, string> = {
  created_task: 'أنشأ مهمة جديدة',
  completed_task: 'أكمل مهمة',
  commented_task: 'علق على مهمة',
  created_project: 'أنشأ مشروع جديد',
  added_member: 'أضاف عضو جديد',
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(response.data.activities.slice(0, 8));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-semibold">النشاطات الأخيرة</h3>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد نشاطات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const config = actionIcons[activity.action] || { icon: PlusCircle, color: 'text-gray-400', bg: 'bg-gray-500/20' };
            const Icon = config.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all"
              >
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-semibold text-purple-400">{activity.userName}</span>
                    {' '}
                    <span className="text-gray-300">{actionText[activity.action] || activity.action}</span>
                    {' '}
                    {activity.targetName && (
                      <span className="text-purple-400">"{activity.targetName}"</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}