'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { SocketProvider } from './SocketProvider';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>{children}</ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
