'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { user, isLoading, isAuthenticated };
}
