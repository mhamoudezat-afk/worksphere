'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertTriangle, ChevronDown, PieChart } from 'lucide-react';

interface BudgetWidgetProps {
  usage: number;
  totalBudget?: number;
  spent?: number;
  remaining?: number;
}

const budgetCategories = [
  { name: 'معدات', amount: 15000, percentage: 15, color: 'from-purple-500 to-pink-500' },
  { name: 'تسويق', amount: 12000, percentage: 12, color: 'from-blue-500 to-cyan-500' },
  { name: 'تشغيل', amount: 10000, percentage: 10, color: 'from-green-500 to-emerald-500' },
  { name: 'مرتبات', amount: 5000, percentage: 5, color: 'from-yellow-500 to-orange-500' },
];

export default function BudgetWidget({ usage, totalBudget = 100000, spent = 42000, remaining = 58000 }: BudgetWidgetProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isOverBudget = usage > 100;
  const isWarning = usage > 80 && !isOverBudget;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-hidden rounded-xl bg-gray-800/30 backdrop-blur-sm p-3 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Wallet className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-white font-medium text-sm">الميزانية</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-0.5 rounded hover:bg-white/10 transition"
        >
          <PieChart className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-1.5 rounded-lg bg-white/5">
          <p className="text-gray-500 text-[9px]">الإجمالي</p>
          <p className="text-white font-bold text-xs">{totalBudget.toLocaleString()}</p>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-white/5">
          <p className="text-gray-500 text-[9px]">المصروف</p>
          <p className="text-orange-400 font-bold text-xs">{spent.toLocaleString()}</p>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-white/5">
          <p className="text-gray-500 text-[9px]">المتبقي</p>
          <p className={`font-bold text-xs ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {remaining.toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-gray-400">المستخدم</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'}`}>
            {Math.min(usage, 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usage, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isOverBudget ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              isWarning ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
          />
        </div>
      </div>
      
      {/* Warning Message */}
      {(isOverBudget || isWarning) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 p-1.5 rounded-lg ${isOverBudget ? 'bg-red-500/20 border border-red-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'}`}
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className={`w-3 h-3 ${isOverBudget ? 'text-red-400' : 'text-yellow-400'}`} />
            <p className={`text-[10px] ${isOverBudget ? 'text-red-400' : 'text-yellow-400'}`}>
              {isOverBudget ? 'تم تجاوز الميزانية!' : 'الميزانية تقترب من النفاد!'}
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Details Section */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-2 border-t border-gray-700 space-y-1.5"
          >
            <p className="text-gray-400 text-[9px] mb-1">توزيع المصروفات</p>
            {budgetCategories.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-gray-500">{item.name}</span>
                  <span className="text-white">{item.amount.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}