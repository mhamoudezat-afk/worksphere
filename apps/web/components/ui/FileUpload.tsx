'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FileUploadProps {
  taskId: string;
  onUploadComplete?: () => void;
}

export default function FileUpload({ taskId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `http://localhost:5000/api/tasks/${taskId}/attachments`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setFiles(prev => [...prev, response.data.file]);
        toast.success(`تم رفع ${file.name} بنجاح`);
        if (onUploadComplete) onUploadComplete();
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`فشل رفع ${file.name}`);
      }
    }
    
    setUploading(false);
  }, [taskId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': []
    }
  });

  const deleteFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}/attachments/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('تم حذف الملف');
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      toast.error('فشل حذف الملف');
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-purple-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-purple-400">أفلت الملف هنا...</p>
        ) : (
          <p className="text-gray-400">
            اسحب وأفلت الملفات هنا، أو انقر للاختيار
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">
          الصور، PDF، مستندات Word (حتى 5MB)
        </p>
      </div>
      
      {uploading && (
        <div className="text-center text-gray-400">
          جاري رفع الملفات...
        </div>
      )}
      
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white font-medium">الملفات المرفوعة</h4>
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white text-sm">{file.name}</p>
                  <p className="text-gray-500 text-xs">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`http://localhost:5000${file.url}`}
                  download
                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}