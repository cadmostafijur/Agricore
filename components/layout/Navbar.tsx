'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Navbar({
  onMenuClickAction,
  onDesktopMenuClickAction,
  desktopSidebarOpen,
}: {
  onMenuClickAction?: () => void;
  onDesktopMenuClickAction?: () => void;
  desktopSidebarOpen?: boolean;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // Replace history entry so Back does not return to a cached dashboard
    router.replace('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        {/* Desktop sidebar toggle */}
        <button
          onClick={onDesktopMenuClickAction}
          className="hidden lg:flex text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {desktopSidebarOpen
            ? <PanelLeftClose className="w-5 h-5" />
            : <PanelLeft className="w-5 h-5" />}
        </button>
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClickAction}
          className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: actions only */}
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative p-1.5 rounded-lg hover:bg-gray-100" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}

