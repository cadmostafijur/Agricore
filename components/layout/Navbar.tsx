'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Menu } from 'lucide-react';

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:block" />

      {/* Right: actions only */}
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>

        <button
          onClick={handleLogout}
          title="Log out"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}

