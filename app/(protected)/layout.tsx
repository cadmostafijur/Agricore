'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);        // mobile
  const [desktopOpen, setDesktopOpen] = useState(true);         // desktop

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
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
          onMenuClick={() => setSidebarOpen(true)}
          onDesktopMenuClick={() => setDesktopOpen((v) => !v)}
          desktopSidebarOpen={desktopOpen}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

