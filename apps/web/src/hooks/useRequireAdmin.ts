'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useRequireAdmin(redirectTo = '/') {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role !== 'admin') {
        router.replace(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo]);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return { user, isLoading, isAuthenticated, isAdmin };
}
