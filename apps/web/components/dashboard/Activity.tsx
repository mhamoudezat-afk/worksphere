import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { Activity as ActivityIcon, User, CheckCircle, Plus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  timestamp: Date;
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', type: 'task', user: 'John Doe', action: 'completed task "Design system"', timestamp: new Date() },
    { id: '2', type: 'project', user: 'Jane Smith', action: 'created new project "Mobile App"', timestamp: new Date() },
    { id: '3', type: 'task', user: 'Mike Johnson', action: 'assigned task "API Integration"', timestamp: new Date() },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'project': return <Plus className="w-4 h-4 text-blue-400" />;
      default: return <User className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <ActivityIcon className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="mt-1">{getIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-white">{activity.user}</span> {activity.action}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}