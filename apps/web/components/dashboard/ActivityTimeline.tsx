'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  CheckCircle, 
  PlusCircle, 
  MessageCircle, 
  UserPlus,
  FolderPlus,
  Edit,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Card from '@/components/ui/Card';

interface Activity {
  _id: string;
  userName: string;
  action: string;
  targetName: string;
  details: any;
  createdAt: string;
}

const actionConfig: Record<string, { icon: any; color: string; bgColor: string; text: string }> = {
  created_task: { 
    icon: PlusCircle, 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20',
    text: 'أنشأ مهمة جديدة'
  },
  completed_task: { 
    icon: CheckCircle, 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20',
    text: 'أكمل مهمة'
  },
  commented_task: { 
    icon: MessageCircle, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/20',
    text: 'علق على مهمة'
  },
  created_project: { 
    icon: FolderPlus, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/20',
    text: 'أنشأ مشروع جديد'
  },
  added_member: { 
    icon: UserPlus, 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-500/20',
    text: 'أضاف عضو جديد'
  },
  updated_task: { 
    icon: Edit, 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20',
    text: 'حدث مهمة'
  },
};

export default function ActivityTimeline() {
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
      setActivities(response.data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">النشاطات الأخيرة</h2>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
        
        <div className="space-y-6">
          <AnimatePresence>
            {activities.slice(0, 10).map((activity, index) => {
              const config = actionConfig[activity.action] || {
                icon: PlusCircle,
                color: 'text-gray-400',
                bgColor: 'bg-gray-500/20',
                text: activity.action
              };
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-4"
                >
                  <div className={`relative z-10 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <p className="text-white text-sm">
                      <span className="font-semibold text-purple-400">{activity.userName}</span>
                      {' '}
                      <span className="text-gray-300">{config.text}</span>
                      {' '}
                      {activity.targetName && (
                        <span className="text-purple-400 font-medium">"{activity.targetName}"</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                    
                    {activity.details?.comment && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 bg-gray-700/50 rounded-lg p-2 border-r-2 border-purple-500"
                      >
                        <p className="text-gray-400 text-xs">"{activity.details.comment}"</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">لا توجد نشاطات بعد</p>
          <p className="text-gray-500 text-sm mt-1">ابدأ بإضافة مهام جديدة</p>
        </div>
      )}
    </Card>
  );
}