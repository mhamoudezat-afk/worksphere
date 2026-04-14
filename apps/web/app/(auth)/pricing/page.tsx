'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Plan {
  name: string;
  price: number;
  period: string;
  icon: any;
  features: string[];
  color: string;
  popular?: boolean;
}

const PLANS: Record<string, Plan> = {
  free: {
    name: 'Free',
    price: 0,
    period: 'شهر',
    icon: Shield,
    features: [
      '3 مشاريع كحد أقصى',
      '5 أعضاء فريق',
      '100 ميجابايت تخزين',
      'مهام غير محدودة',
      'دعم أساسي'
    ],
    color: 'from-gray-500 to-gray-600'
  },
  pro: {
    name: 'Pro',
    price: 29,
    period: 'شهر',
    icon: Zap,
    features: [
      '50 مشروع كحد أقصى',
      '20 عضو فريق',
      '5 جيجابايت تخزين',
      'حقول مخصصة',
      'تقارير متقدمة',
      'API access',
      'دعم優先'
    ],
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    period: 'شهر',
    icon: Crown,
    features: [
      'مشاريع غير محدودة',
      'أعضاء غير محدودين',
      '50 جيجابايت تخزين',
      'جميع الميزات',
      'دعم VIP 24/7',
      'تكامل مخصص',
      'SLA مضمون'
    ],
    color: 'from-yellow-500 to-orange-500'
  }
};

export default function PricingPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:5000/api/subscription', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentPlan(response.data.plan);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    }
  };

  const handleUpgrade = async (plan: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('الرجاء تسجيل الدخول أولاً');
      router.push('/login');
      return;
    }
    
    if (plan === currentPlan) {
      toast.success(`أنت بالفعل مشترك في خطة ${PLANS[plan].name}`);
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put('http://localhost:5000/api/subscription/upgrade', 
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentPlan(plan);
      toast.success(`تم الترقية إلى خطة ${PLANS[plan].name} بنجاح`);
      
    } catch (error) {
      console.error('Failed to upgrade:', error);
      toast.error('حدث خطأ، الرجاء المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            خطط تناسب{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              جميع الأحجام
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            اختر الخطة المناسبة لعملك وابدأ في إدارة مشاريعك بكفاءة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === key;
            
            return (
              <div
                key={key}
                className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-purple-500 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-lg text-sm">
                    الأكثر شعبية
                  </div>
                )}
                
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={loading || isCurrent}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-green-600 text-white cursor-default'
                        : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isCurrent ? 'الخطة الحالية' : `اختر ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400">
            جميع الخطط تشمل ضمان استرداد الأموال لمدة 14 يوماً
          </p>
        </div>
      </div>
    </div>
  );
}