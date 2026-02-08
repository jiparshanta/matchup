'use client';

import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAdmin } = useRequireAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
