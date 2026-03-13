'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Bell } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Page context (populated by child pages) */}
      <div />

      {/* Right: user + actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell placeholder */}
        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell className="w-5 h-5" />
        </button>

        {/* User identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <Image src={user.avatar} alt="avatar" fill className="object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary-600">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p
              className={clsx(
                'text-xs font-medium',
                user?.role === 'Admin' ? 'text-yellow-600' : 'text-primary-600'
              )}
            >
              {user?.role}
            </p>
          </div>
        </div>

        {/* Logout */}
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
