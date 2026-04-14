'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, X, Clock } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

interface SmartAlertsProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  danger: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

export default function SmartAlerts({ alerts, onDismiss }: SmartAlertsProps) {
  const [showAll, setShowAll] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  
  const activeAlerts = alerts.filter(a => !dismissed.includes(a.id));
  const unreadCount = activeAlerts.filter(a => !a.read).length;
  const displayedAlerts = showAll ? activeAlerts : activeAlerts.slice(0, 2);
  
  const handleDismiss = (id: string) => {
    setDismissed([...dismissed, id]);
    onDismiss?.(id);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-hidden rounded-xl bg-gray-800/30 backdrop-blur-sm p-3 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <Bell className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <h3 className="text-white font-medium text-sm">التنبيهات</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="space-y-2">
        <AnimatePresence>
          {displayedAlerts.map((alert, index) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg ${config.bg} border ${config.border} p-2`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-3.5 h-3.5 ${config.color} mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="text-white text-[10px] font-medium">{alert.title}</p>
                      {!alert.read && <span className="w-1 h-1 rounded-full bg-purple-400" />}
                    </div>
                    <p className={`text-[9px] ${config.color} mt-0.5`}>{alert.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2 h-2 text-gray-500" />
                      <span className="text-gray-500 text-[8px]">{alert.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="p-0.5 rounded hover:bg-white/10 transition"
                  >
                    <X className="w-2.5 h-2.5 text-gray-500" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Show More */}
      {activeAlerts.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full py-1 text-center text-purple-400 text-[9px] hover:text-purple-300 transition border-t border-gray-700 pt-2"
        >
          {showAll ? 'عرض أقل' : `عرض ${activeAlerts.length - 2} أكثر`}
        </button>
      )}
    </motion.div>
  );
}