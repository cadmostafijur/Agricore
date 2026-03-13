'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { PanelLeft } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);        // mobile
  const [desktopOpen, setDesktopOpen] = useState(true);         // desktop

  const isAdminPath = pathname.startsWith('/admin');
  const isBlocked = !isLoading && (!isAuthenticated || (isAdminPath && user?.role !== 'Admin'));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const params = new URLSearchParams();
      params.set('redirect', pathname);
      router.replace(`/login?${params.toString()}`);
      return;
    }

    if (isAdminPath && user?.role !== 'Admin') {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdminPath, pathname, router, user?.role]);

  if (isLoading || isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      {desktopOpen && (
        <div className="hidden lg:flex w-64 flex-shrink-0 border-r border-gray-100">
          <Sidebar open={false} onClose={() => setDesktopOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mobileOnly />
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar
          onMenuClickAction={() => setSidebarOpen(true)}
        />
        {!desktopOpen && (
          <button
            type="button"
            onClick={() => setDesktopOpen(true)}
            className="hidden lg:flex fixed left-3 top-20 z-30 items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

