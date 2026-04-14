'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, DollarSign, TrendingUp,
  Calendar, Plus, Edit, Trash2, Search,
  Wallet, Award, Clock, CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Employee {
  _id: string;
  name: string;
  position: string;
  baseSalary: number;
  phone: string;
  email: string;
  hireDate: string;
  status: string;
}

interface Salary {
  _id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  month: string;
  year: number;
  status: string;
  paidDate: string;
}

export default function SalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalSalariesPaid: 0,
    currentMonthSalaries: 0,
    averageSalary: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'salaries'>('employees');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    position: '',
    baseSalary: '',
    phone: '',
    email: ''
  });
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    employeeName: '',
    baseSalary: '',
    bonus: '',
    deductions: '',
    month: new Date().toLocaleString('ar-EG', { month: 'long' }),
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, salariesRes, summaryRes] = await Promise.all([
        api.get('/employees'),
        api.get('/salaries'),
        api.get('/salaries/summary')
      ]);
      setEmployees(employeesRes.data);
      setSalaries(salariesRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch salary data:', error);
      toast.error('فشل في تحميل بيانات المرتبات');
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!employeeForm.name || !employeeForm.position || !employeeForm.baseSalary) {
      toast.error('الرجاء إدخال جميع البيانات');
      return;
    }

    try {
      await api.post('/employees', {
        ...employeeForm,
        baseSalary: parseFloat(employeeForm.baseSalary)
      });
      toast.success('تم إضافة الموظف بنجاح');
      setIsEmployeeModalOpen(false);
      setEmployeeForm({ name: '', position: '', baseSalary: '', phone: '', email: '' });
      fetchData();
    } catch (error) {
      toast.error('فشل في إضافة الموظف');
    }
  };

  const handleAddSalary = async () => {
    if (!salaryForm.employeeId || !salaryForm.baseSalary) {
      toast.error('الرجاء اختيار الموظف');
      return;
    }

    try {
      await api.post('/salaries', {
        employeeId: salaryForm.employeeId,
        employeeName: salaryForm.employeeName,
        baseSalary: parseFloat(salaryForm.baseSalary),
        bonus: parseFloat(salaryForm.bonus) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0,
        month: salaryForm.month,
        year: parseInt(salaryForm.year)
      });
      toast.success('تم تسجيل المرتب بنجاح');
      setIsSalaryModalOpen(false);
      setSalaryForm({
        employeeId: '', employeeName: '', baseSalary: '', bonus: '', deductions: '',
        month: new Date().toLocaleString('ar-EG', { month: 'long' }),
        year: new Date().getFullYear().toString()
      });
      fetchData();
    } catch (error) {
      toast.error('فشل في تسجيل المرتب');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('تم حذف الموظف');
      fetchData();
    } catch (error) {
      toast.error('فشل في حذف الموظف');
    }
  };

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString() + ' ج.م';
  };

  if (loading) return <SalarySkeleton />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            إدارة الرواتب والموظفين
          </h1>
          <p className="text-gray-400 text-sm mt-1">إدارة الموظفين ورواتبهم ومكافآتهم</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'employees' ? (
            <Button size="sm" onClick={() => setIsEmployeeModalOpen(true)}>
              <UserPlus className="w-4 h-4 ml-1" />
              إضافة موظف
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsSalaryModalOpen(true)}>
              <Plus className="w-4 h-4 ml-1" />
              تسجيل مرتب
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-3 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-purple-400">{summary.totalEmployees}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-3 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs">إجمالي المرتبات</p>
              <p className="text-2xl font-bold text-green-400">{formatMoney(summary.totalSalariesPaid)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-3 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs">مرتبات هذا الشهر</p>
              <p className="text-2xl font-bold text-orange-400">{formatMoney(summary.currentMonthSalaries)}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs">متوسط المرتب</p>
              <p className="text-2xl font-bold text-blue-400">{formatMoney(summary.averageSalary)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          الموظفين
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'salaries'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          سجل المرتبات
        </button>
      </div>

      {/* Employees List */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map((employee, index) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              index={index}
              onDelete={() => handleDeleteEmployee(employee._id)}
              onSelect={() => {
                setSelectedEmployee(employee);
                setSalaryForm({
                  ...salaryForm,
                  employeeId: employee._id,
                  employeeName: employee.name,
                  baseSalary: employee.baseSalary.toString()
                });
                setIsSalaryModalOpen(true);
              }}
            />
          ))}
          {employees.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              لا يوجد موظفين. أضف موظفك الأول
            </div>
          )}
        </div>
      )}

      {/* Salaries List */}
      {activeTab === 'salaries' && (
        <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-right p-3 text-gray-300 text-xs">الموظف</th>
                  <th className="text-right p-3 text-gray-300 text-xs">الراتب الأساسي</th>
                  <th className="text-right p-3 text-gray-300 text-xs">الحوافز</th>
                  <th className="text-right p-3 text-gray-300 text-xs">الخصومات</th>
                  <th className="text-right p-3 text-gray-300 text-xs">الصافي</th>
                  <th className="text-right p-3 text-gray-300 text-xs">الشهر</th>
                  <th className="text-right p-3 text-gray-300 text-xs">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((salary, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="p-3 text-white text-sm">{salary.employeeName}</td>
                    <td className="p-3 text-gray-300 text-sm">{formatMoney(salary.baseSalary)}</td>
                    <td className="p-3 text-green-400 text-sm">+{formatMoney(salary.bonus)}</td>
                    <td className="p-3 text-red-400 text-sm">-{formatMoney(salary.deductions)}</td>
                    <td className="p-3 text-purple-400 font-semibold text-sm">{formatMoney(salary.netSalary)}</td>
                    <td className="p-3 text-gray-300 text-sm">{salary.month} {salary.year}</td>
                    <td className="p-3 text-gray-400 text-xs">{new Date(salary.paidDate).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {salaries.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              لا توجد مرتبات مسجلة
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title="إضافة موظف جديد">
        <div className="space-y-3">
          <Input
            label="الاسم"
            placeholder="أدخل اسم الموظف"
            value={employeeForm.name}
            onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
          />
          <Input
            label="الوظيفة"
            placeholder="المسمى الوظيفي"
            value={employeeForm.position}
            onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
          />
          <Input
            label="الراتب الأساسي"
            type="number"
            placeholder="0.00"
            value={employeeForm.baseSalary}
            onChange={(e) => setEmployeeForm({ ...employeeForm, baseSalary: e.target.value })}
          />
          <Input
            label="رقم الهاتف"
            placeholder="رقم الهاتف"
            value={employeeForm.phone}
            onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="email@example.com"
            value={employeeForm.email}
            onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
          />
          <div className="flex gap-3 pt-3">
            <Button onClick={handleAddEmployee} className="flex-1">إضافة</Button>
            <Button variant="outline" onClick={() => setIsEmployeeModalOpen(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      {/* Add Salary Modal */}
      <Modal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} title="تسجيل مرتب">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الموظف</label>
            <select
              value={salaryForm.employeeId}
              onChange={(e) => {
                const emp = employees.find(e => e._id === e.target.value);
                setSalaryForm({
                  ...salaryForm,
                  employeeId: e.target.value,
                  employeeName: emp?.name || '',
                  baseSalary: emp?.baseSalary.toString() || ''
                });
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="">اختر موظف</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </div>
          <Input
            label="الراتب الأساسي"
            type="number"
            value={salaryForm.baseSalary}
            onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
          />
          <Input
            label="الحوافز"
            type="number"
            placeholder="0"
            value={salaryForm.bonus}
            onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })}
          />
          <Input
            label="الخصومات"
            type="number"
            placeholder="0"
            value={salaryForm.deductions}
            onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الشهر</label>
              <select
                value={salaryForm.month}
                onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <Input
              label="السنة"
              type="number"
              value={salaryForm.year}
              onChange={(e) => setSalaryForm({ ...salaryForm, year: e.target.value })}
            />
          </div>
          <div className="bg-purple-500/10 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">المرتب الصافي</p>
            <p className="text-xl font-bold text-purple-400">
              {formatMoney((parseFloat(salaryForm.baseSalary) || 0) + (parseFloat(salaryForm.bonus) || 0) - (parseFloat(salaryForm.deductions) || 0))}
            </p>
          </div>
          <div className="flex gap-3 pt-3">
            <Button onClick={handleAddSalary} className="flex-1">تسجيل</Button>
            <Button variant="outline" onClick={() => setIsSalaryModalOpen(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EmployeeCard({ employee, index, onDelete, onSelect }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="bg-gray-800/30 rounded-xl p-3 border border-gray-700 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{employee.name}</h4>
            <p className="text-gray-400 text-xs">{employee.position}</p>
          </div>
        </div>
        <button onClick={onDelete} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">الراتب</span>
          <span className="text-green-400">{employee.baseSalary.toLocaleString()} ج.م</span>
        </div>
        <button
          onClick={onSelect}
          className="w-full mt-2 py-1 text-center bg-purple-600/20 text-purple-400 rounded-lg text-xs hover:bg-purple-600/30 transition"
        >
          تسجيل مرتب
        </button>
      </div>
    </motion.div>
  );
}

function SalarySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-9 bg-gray-700 rounded-xl w-24"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-800/30 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-800/30 rounded-xl" />)}
      </div>
    </div>
  );
}