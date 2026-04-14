'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useRealtime = (projectId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      if (projectId) {
        newSocket.emit('join-project', projectId);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [projectId]);

  return socket;
};