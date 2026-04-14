'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { 
  ArrowRight, CheckCircle, Zap, Shield, Users, 
  BarChart3, Star, Rocket, Clock, Globe, Bell, 
  MessageSquare, FolderKanban, Sparkles, ChevronRight,
  Award, Target, TrendingUp, Calendar, FileText, Cloud,
  Menu, X, Github, Twitter, Linkedin, Mail, DollarSign,
  Briefcase, Headphones
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const features = [
  {
    icon: FolderKanban,
    title: 'إدارة المشاريع',
    description: 'نظم مشاريعك بشكل احترافي مع لوحات تحكم مرنة وسحب وإفلات',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Zap,
    title: 'مهام ذكية',
    description: 'تتبع المهام مع الأولويات والتواريخ والمهام الفرعية والتعليقات',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    title: 'تعاون الفريق',
    description: 'اعمل مع فريقك في الوقت الفعلي مع إشعارات فورية',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: BarChart3,
    title: 'تقارير متقدمة',
    description: 'تحليلات وإحصائيات متقدمة لقياس أداء فريقك',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Bell,
    title: 'إشعارات فورية',
    description: 'ابق على اطلاع دائم بكل التحديثات في فريقك',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Globe,
    title: 'عمل عن بُعد',
    description: 'اعمل من أي مكان مع مزامنة سحابية كاملة',
    color: 'from-indigo-500 to-purple-500'
  },
];

const additionalServices = [
  {
    icon: Cloud,
    title: 'تخزين سحابي آمن',
    description: 'تخزين جميع ملفاتك وبياناتك في سحابة آمنة مع تشفير كامل',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Target,
    title: 'تتبع الأهداف',
    description: 'حدد أهدافك وتابع تقدمك مع لوحات تحكم متقدمة وتقارير دورية',
    color: 'from-emerald-500 to-green-500'
  },
  {
    icon: Calendar,
    title: 'جدولة ذكية',
    description: 'جدولة المهام والمواعيد تلقائياً مع تذكيرات ذكية',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: TrendingUp,
    title: 'تحليلات متقدمة',
    description: 'تحليلات وإحصائيات متقدمة لأداء فريقك ومشاريعك',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: FileText,
    title: 'تقارير مخصصة',
    description: 'إنشاء تقارير مخصصة ومشاركتها مع فريقك بضغطة زر',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Award,
    title: 'نظام المكافآت',
    description: 'حفز فريقك بنظام المكافآت والإنجازات',
    color: 'from-yellow-500 to-amber-500'
  },
];

const testimonials = [
  {
    name: 'أحمد السيد',
    role: 'مدير منتج',
    content: 'WorkSphere غير طريقة عمل فريقنا بالكامل. أصبحنا أكثر تنظيماً وإنتاجية بنسبة 200%',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=أحمد'
  },
  {
    name: 'نورا محمود',
    role: 'مصممة UI/UX',
    content: 'واجهة المستخدم رائعة جداً وسهلة الاستخدام. أفضل منصة استخدمتها لإدارة المشاريع',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=نورا'
  },
  {
    name: 'محمد علي',
    role: 'CEO',
    content: 'ساعدتنا المنصة على تنظيم مهامنا وزيادة إنتاجية الفريق. أنصح بها بشدة',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=محمد'
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    period: 'شهر',
    features: ['3 مشاريع', '5 أعضاء فريق', '100 ميجابايت تخزين', 'مهام غير محدودة', 'دعم أساسي'],
    buttonText: 'ابدأ مجاناً',
    popular: false,
    color: 'from-gray-500 to-gray-600'
  },
  {
    name: 'Pro',
    price: 29,
    period: 'شهر',
    features: ['50 مشروع', '20 عضو فريق', '5 جيجابايت تخزين', 'حقول مخصصة', 'تقارير متقدمة', 'API access'],
    buttonText: 'اختر Pro',
    popular: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'شهر',
    features: ['مشاريع غير محدودة', 'أعضاء غير محدودين', '50 جيجابايت تخزين', 'دعم VIP 24/7', 'تكامل مخصص', 'SLA مضمون'],
    buttonText: 'تواصل معنا',
    popular: false,
    color: 'from-yellow-500 to-orange-500'
  },
];

const stats = [
  { value: '10K+', label: 'مستخدم نشط', icon: Users, color: 'from-purple-500 to-pink-500' },
  { value: '50K+', label: 'مشروع منجز', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
  { value: '98%', label: 'رضا العملاء', icon: Star, color: 'from-yellow-500 to-orange-500' },
  { value: '24/7', label: 'دعم فني', icon: Headphones, color: 'from-blue-500 to-cyan-500' },
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (featuresInView) {
      controls.start('visible');
    }
  }, [controls, featuresInView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-gray-950/80 backdrop-blur-xl shadow-2xl border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  WorkSphere
                </span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {['الميزات', 'الخدمات', 'الخطط', 'تواصل'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item === 'الميزات' ? 'features' : item === 'الخدمات' ? 'services' : item === 'الخطط' ? 'pricing' : 'contact'}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex items-center gap-4"
            >
              <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                ابدأ مجاناً
              </Link>
            </motion.div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-white/10 md:hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {['الميزات', 'الخدمات', 'الخطط', 'تواصل'].map((item) => (
                <Link
                  key={item}
                  href={`#${item === 'الميزات' ? 'features' : item === 'الخدمات' ? 'services' : item === 'الخطط' ? 'pricing' : 'contact'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-center text-gray-300 hover:bg-white/5 rounded-lg transition"
                >
                  {item}
                </Link>
              ))}
              <div className="pt-4 space-y-3 border-t border-white/10">
                <Link href="/login" className="block py-2 text-center text-gray-300 hover:bg-white/5 rounded-lg transition">تسجيل الدخول</Link>
                <Link href="/register" className="block py-2 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold">ابدأ مجاناً</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-7xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 mb-8 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-white text-sm">أطلق العنان لإبداع فريقك</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
          >
            أدر مشاريعك{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              بذكاء
            </span>
            <br />
            مع WorkSphere
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            منصة إدارة المشاريع المتكاملة التي تجمع فريقك في مكان واحد. 
            نظم مهامك، تابع تقدمك، وحقق أهدافك بشكل أسرع.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg overflow-hidden shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 group-hover:w-full" />
              <span className="relative z-10 flex items-center gap-2">
                ابدأ مجاناً
                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              اكتشف المزيد
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                className="text-center group"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
              ميزات{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                قوية
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-2xl mx-auto">
              كل ما تحتاجه لإدارة مشاريعك بنجاح في منصة واحدة
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              خدمات{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                إضافية
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              ميزات إضافية تجعل WorkSphere الخيار الأمثل لإدارة أعمالك
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-500 group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              خطط{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                تناسب الجميع
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              اختر الخطة المناسبة لعملك وابدأ رحلتك مع WorkSphere
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                  plan.popular ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/25' : 'bg-white/5 backdrop-blur-xl border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    الأكثر شعبية
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/register'}
                    className={`block w-full py-3 text-center rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              آراء{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                مستخدمينا
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              آلاف الفرق تثق في WorkSphere
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img src={testimonials[activeTestimonial].avatar} alt="" className="w-14 h-14 rounded-full" />
                  <div>
                    <h4 className="text-white font-semibold text-lg">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-gray-400 text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{testimonials[activeTestimonial].content}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeTestimonial === index ? 'w-8 bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-12 overflow-hidden border border-purple-500/30"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                جاهز لبدء رحلتك؟
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                انضم إلى آلاف الفرق التي تستخدم WorkSphere لإدارة مشاريعها
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                ابدأ مجاناً الآن
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/60 text-sm mt-4">
                لا حاجة لبطاقة ائتمان · إلغاء في أي وقت
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  WorkSphere
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                منصة إدارة المشاريع المتكاملة التي تجمع فريقك في مكان واحد.
              </p>
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">المنتج</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-purple-400 text-sm transition">الميزات</Link></li>
                <li><Link href="#services" className="text-gray-400 hover:text-purple-400 text-sm transition">الخدمات</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-purple-400 text-sm transition">الخطط</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">الشركة</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">عننا</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">المدونة</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">وظائف</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">الدعم</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">مركز المساعدة</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">التواصل</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-purple-400 text-sm transition">الخصوصية</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} WorkSphere. تم التطوير بواسطة محمود عزت
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}