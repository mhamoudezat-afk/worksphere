import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const initSocket = (token: string) => {
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });
};