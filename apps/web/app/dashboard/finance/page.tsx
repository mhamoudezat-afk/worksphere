'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  Receipt, Package, Users, Building2, Plus,
  Search, Edit, Trash2, PieChart as PieChartIcon
} from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

interface Summary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  totalExpenses: number;
  totalTaxes: number;
  totalSalaries: number;
  totalInventory: number;
  byType: {
    equipment: number;
    marketing: number;
    operations: number;
    tax: number;
    salary: number;
    inventory: number;
  };
  projectsCount: number;
  expensesCount: number;
  productsCount: number;
  salariesCount: number;
}

export default function FinancePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'taxes' | 'inventory' | 'salaries'>('overview');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    amount: '',
    type: 'operations',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSummary();
    fetchExpenses();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/finance/summary');
      setSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      toast.error('فشل في تحميل البيانات المالية');
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/finance/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.name || !expenseForm.amount) {
      toast.error('الرجاء إدخال جميع البيانات');
      return;
    }

    try {
      await api.post('/finance/expenses', {
        name: expenseForm.name,
        amount: parseFloat(expenseForm.amount),
        type: expenseForm.type,
        date: expenseForm.date
      });
      toast.success('تم إضافة المصروف بنجاح');
      setIsExpenseModalOpen(false);
      setExpenseForm({ name: '', amount: '', type: 'operations', date: new Date().toISOString().split('T')[0] });
      fetchSummary();
      fetchExpenses();
    } catch (error) {
      toast.error('فشل في إضافة المصروف');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await api.delete(`/finance/expenses/${id}`);
      toast.success('تم حذف المصروف');
      fetchSummary();
      fetchExpenses();
    } catch (error) {
      toast.error('فشل في حذف المصروف');
    }
  };

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString() + ' ج.م';
  };

  const COLORS = ['#8b5cf6', '#f97316', '#22c55e', '#ef4444', '#3b82f6', '#eab308'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">النظام المالي</h1>
          <p className="text-gray-400 mt-1">إدارة المصروفات والضرائب والمخزون والمرتبات</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">إجمالي الميزانية</p>
              <p className="text-2xl font-bold text-purple-400">{formatMoney(summary?.totalBudget || 0)}</p>
            </div>
            <Wallet className="w-10 h-10 text-purple-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-orange-400">{formatMoney(summary?.totalExpenses || 0)}</p>
            </div>
            <TrendingDown className="w-10 h-10 text-orange-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">المتبقي</p>
              <p className="text-2xl font-bold text-green-400">{formatMoney(summary?.remainingBudget || 0)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">المرتبات</p>
              <p className="text-2xl font-bold text-blue-400">{formatMoney(summary?.totalSalaries || 0)}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: PieChartIcon },
          { id: 'expenses', label: 'المصروفات', icon: Receipt },
          { id: 'taxes', label: 'الضرائب', icon: Building2 },
          { id: 'inventory', label: 'المخزون', icon: Package },
          { id: 'salaries', label: 'المرتبات', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">توزيع المصروفات</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'معدات', value: summary?.byType.equipment || 0 },
                      { name: 'تسويق', value: summary?.byType.marketing || 0 },
                      { name: 'تشغيل', value: summary?.byType.operations || 0 },
                      { name: 'ضرائب', value: summary?.byType.tax || 0 },
                      { name: 'مرتبات', value: summary?.byType.salary || 0 },
                      { name: 'مخزون', value: summary?.byType.inventory || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">إحصائيات سريعة</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">عدد المشاريع</span>
                  <span className="text-white font-bold">{summary?.projectsCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">عدد المصروفات</span>
                  <span className="text-white font-bold">{summary?.expensesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">عدد المنتجات</span>
                  <span className="text-white font-bold">{summary?.productsCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">عدد المرتبات</span>
                  <span className="text-white font-bold">{summary?.salariesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">استخدام الميزانية</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">المستخدم</span>
                <span className="text-purple-400">{Math.round((summary?.totalSpent || 0) / (summary?.totalBudget || 1) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${Math.min(100, (summary?.totalSpent || 0) / (summary?.totalBudget || 1) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 ج.م</span>
                <span>{formatMoney((summary?.totalBudget || 0) / 2)}</span>
                <span>{formatMoney(summary?.totalBudget || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث عن مصروف..."
                className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <Button size="sm" onClick={() => setIsExpenseModalOpen(true)}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة مصروف
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-right p-3 text-gray-300 text-sm">الاسم</th>
                  <th className="text-right p-3 text-gray-300 text-sm">القيمة</th>
                  <th className="text-right p-3 text-gray-300 text-sm">النوع</th>
                  <th className="text-right p-3 text-gray-300 text-sm">التاريخ</th>
                  <th className="text-right p-3 text-gray-300 text-sm">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: any, i: number) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="p-3 text-white">{expense.name}</td>
                    <td className="p-3 text-orange-400">{expense.amount.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        expense.type === 'equipment' ? 'bg-purple-500/20 text-purple-400' :
                        expense.type === 'marketing' ? 'bg-blue-500/20 text-blue-400' :
                        expense.type === 'salary' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {expense.type === 'equipment' ? 'معدات' :
                         expense.type === 'marketing' ? 'تسويق' :
                         expense.type === 'salary' ? 'مرتب' : 'تشغيل'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">{new Date(expense.date).toLocaleDateString('ar-EG')}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Taxes Tab */}
      {activeTab === 'taxes' && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>قائمة الضرائب</p>
          <p className="text-sm">سيتم إضافة التفاصيل قريباً</p>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>قائمة المخزون</p>
          <p className="text-sm">سيتم إضافة التفاصيل قريباً</p>
        </div>
      )}

      {/* Salaries Tab */}
      {activeTab === 'salaries' && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>قائمة المرتبات</p>
          <p className="text-sm">سيتم إضافة التفاصيل قريباً</p>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="إضافة مصروف جديد">
        <div className="space-y-4">
          <Input
            label="الاسم"
            placeholder="أدخل اسم المصروف"
            value={expenseForm.name}
            onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
          />
          <Input
            label="القيمة"
            type="number"
            placeholder="0.00"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">النوع</label>
            <select
              value={expenseForm.type}
              onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="equipment">معدات</option>
              <option value="marketing">تسويق</option>
              <option value="operations">تشغيل</option>
              <option value="salary">مرتبات</option>
            </select>
          </div>
          <Input
            label="التاريخ"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddExpense} className="flex-1">إضافة</Button>
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}