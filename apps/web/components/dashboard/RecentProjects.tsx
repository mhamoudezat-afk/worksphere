'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description: string;
  priority: string;
}

export default function RecentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">أحدث المشاريع</h2>
        </div>
        <Link href="/dashboard/projects" className="text-purple-400 hover:text-purple-300 text-sm">
          عرض الكل →
        </Link>
      </div>
      
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project._id} className="p-3 bg-gray-700 rounded-lg">
            <p className="text-white font-medium">{project.name}</p>
            <p className="text-gray-400 text-sm">{project.description?.slice(0, 50)}</p>
          </div>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          لا توجد مشاريع بعد
        </div>
      )}
    </Card>
  );
}