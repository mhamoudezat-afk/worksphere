'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  userName: string;
  content: string;
  createdAt: string;
}

interface TaskCommentsProps {
  taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data.comments || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(response.data.comments);
      setNewComment('');
      toast.success('تم إضافة التعليق');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('فشل إضافة التعليق');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            لا توجد تعليقات بعد
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                  {comment.userName?.charAt(0) || '?'}
                </div>
                <span className="text-white text-sm font-medium">{comment.userName}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(comment.createdAt).toLocaleString('ar-EG')}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addComment()}
          placeholder="اكتب تعليق..."
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={addComment}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}