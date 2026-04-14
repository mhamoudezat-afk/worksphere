'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// تحميل بطيء للمكونات الثقيلة
const TaskBoard = dynamic(
  () => import('@/components/dashboard/TaskBoard'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const StatsChart = dynamic(
  () => import('@/components/dashboard/StatsChart'),
  { 
    loading: () => <div className="h-64 bg-gray-800 rounded-xl animate-pulse" />,
    ssr: false 
  }
);

// إنشاء مكون ActivityTimeline بسيط مؤقت
const ActivityTimeline = dynamic(
  () => import('@/components/dashboard/ActivityTimeline').catch(() => () => <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400">قيد التطوير</div>),
  { 
    loading: () => <div className="h-96 bg-gray-800 rounded-xl animate-pulse" />,
    ssr: false 
  }
);

export { TaskBoard, StatsChart, ActivityTimeline };