'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { getAuthToken } from '@/lib/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    if (!isAuthenticated) {
      import('@/lib/socket').then(({ disconnectSocket }) => {
        disconnectSocket();
      });
      setSocket(null);
      setIsConnected(false);
      return;
    }

    let cleanup: (() => void) | undefined;

    const initSocket = async () => {
      const token = await getAuthToken();
      if (token) {
        const { getSocket, connectSocket } = await import('@/lib/socket');
        const s = getSocket();

        // Socket might be null if not configured
        if (!s) {
          return;
        }

        connectSocket(token);
        setSocket(s);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        s.on('connect', handleConnect);
        s.on('disconnect', handleDisconnect);

        cleanup = () => {
          s.off('connect', handleConnect);
          s.off('disconnect', handleDisconnect);
        };
      }
    };

    initSocket();

    return () => {
      cleanup?.();
      import('@/lib/socket').then(({ disconnectSocket }) => {
        disconnectSocket();
      });
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
