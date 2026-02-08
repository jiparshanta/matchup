'use client';

import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuthStore } from '@/stores/authStore';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:pb-6"
        style={{
          paddingBottom: isAuthenticated ? 'calc(80px + var(--safe-area-inset-bottom, 0px))' : '24px',
        }}
      >
        {children}
      </main>
      {isAuthenticated && <MobileNav />}
    </div>
  );
}
