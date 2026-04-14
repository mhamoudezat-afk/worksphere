'use client';

import { toast } from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

export const showUndoToast = (
  message: string,
  onUndo: () => void,
  duration = 5000
) => {
  toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 flex items-center gap-4 min-w-[320px]`}>
        <span className="text-white flex-1">{message}</span>
        <button
          onClick={() => {
            onUndo();
            toast.dismiss(t.id);
          }}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          تراجع
        </button>
      </div>
    ),
    { duration }
  );
};