'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  User2,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import clsx from 'clsx';

const customerNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile',   label: 'Profile',   icon: User2 },
];

const adminNav = [
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = user?.role === 'Admin' ? [...customerNav, ...adminNav] : customerNav;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex-col flex-shrink-0 hidden lg:flex">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-primary-900">AgriCore</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={clsx('w-5 h-5', active ? 'text-primary-600' : 'text-gray-400')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-600">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
