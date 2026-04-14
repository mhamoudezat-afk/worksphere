'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimistic<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: OptimisticOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (params: P, optimisticData?: T) => {
      setIsLoading(true);
      setError(null);

      try {
        // Optimistic update
        if (optimisticData && options.onSuccess) {
          options.onSuccess(optimisticData);
        }

        const result = await mutationFn(params);
        
        // Real update
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        
        return result;
      } catch (err: any) {
        setError(err);
        toast.error(options.errorMessage || err.message || 'حدث خطأ');
        if (options.onError) options.onError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  return { execute, isLoading, error };
}