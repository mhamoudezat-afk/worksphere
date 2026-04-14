'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  labels: string[];
  dueDate: string;
  subtasks: any[];
  comments: any[];
  assignee?: { name: string; email: string };
}

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate?: () => void;
}

const columns = [
  { id: 'todo', title: '📋 قائمة المهام', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/10' },
  { id: 'in-progress', title: '⚙️ قيد التنفيذ', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
  { id: 'review', title: '🔍 مراجعة', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10' },
  { id: 'done', title: '✅ مكتمل', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10' },
];

export default function TaskBoard({ tasks, onTaskUpdate }: TaskBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTask = localTasks.find((t) => t._id === active.id);
    const newStatus = over.id as string;
    
    if (activeTask && activeTask.status !== newStatus) {
      // Optimistic update
      setLocalTasks((prev) =>
        prev.map((t) =>
          t._id === activeTask._id ? { ...t, status: newStatus } : t
        )
      );
      
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:5000/api/tasks/${activeTask._id}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success(`تم نقل المهمة إلى ${columns.find(c => c.id === newStatus)?.title}`);
        onTaskUpdate?.();
      } catch (error) {
        // Revert on error
        setLocalTasks((prev) =>
          prev.map((t) =>
            t._id === activeTask._id ? { ...t, status: activeTask.status } : t
          )
        );
        toast.error('فشل تحديث حالة المهمة');
      }
    }
  };

  const getTasksByStatus = useCallback((status: string) => {
    return localTasks.filter((task) => task.status === status);
  }, [localTasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[800px]">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${column.bgColor} rounded-2xl p-4 border border-gray-700`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{column.title}</h3>
                <div className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${column.color} text-white`}>
                  {getTasksByStatus(column.id).length}
                </div>
              </div>
              
              <SortableContext
                items={getTasksByStatus(column.id).map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {getTasksByStatus(column.id).map((task, index) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TaskCard task={task} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </motion.div>
          ))}
        </div>
      </div>
    </DndContext>
  );
}