'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOptions {
  status?: string;
  priority?: string;
  project?: string;
}

interface SearchFilterProps {
  items: any[];
  onFilterChange: (filtered: any[]) => void;
  projects?: any[];
}

export default function SearchFilter({ items, onFilterChange, projects = [] }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredItems = useMemo(() => {
    let result = [...items];
    
    if (searchTerm) {
      result = result.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.status) {
      result = result.filter(item => item.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(item => item.priority === filters.priority);
    }
    
    if (filters.project) {
      result = result.filter(item => item.project?._id === filters.project);
    }
    
    onFilterChange(result);
    return result;
  }, [items, searchTerm, filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const activeFiltersCount = Object.keys(filters).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن مهمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeFiltersCount > 0
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            فلترة
            {activeFiltersCount > 0 && (
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الحالة</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">الكل</option>
                    <option value="todo">📋 قائمة المهام</option>
                    <option value="in-progress">⚙️ قيد التنفيذ</option>
                    <option value="review">🔍 مراجعة</option>
                    <option value="done">✅ مكتمل</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الأولوية</label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">الكل</option>
                    <option value="urgent">🔴 عاجلة</option>
                    <option value="high">🟠 عالية</option>
                    <option value="medium">🟡 متوسطة</option>
                    <option value="low">🟢 منخفضة</option>
                  </select>
                </div>
                
                {projects.length > 0 && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">المشروع</label>
                    <select
                      value={filters.project || ''}
                      onChange={(e) => setFilters({ ...filters, project: e.target.value || undefined })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">كل المشاريع</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}