'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if persist API is available
    const persist = useAuthStore.persist;
    if (!persist || !persist.onFinishHydration || !persist.rehydrate) {
      // If persist isn't available, just mark as hydrated
      setIsHydrated(true);
      return;
    }

    // Subscribe to hydration finish event
    const unsubFinishHydration = persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Trigger rehydration
    persist.rehydrate();

    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      useAuthStore.getState().checkAuth();
    }
  }, [isHydrated]);

  // Show loading until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
