'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import {
  LayoutDashboard,
  User2,
  ShieldCheck,
  Leaf,
  X,
} from 'lucide-react';
import clsx from 'clsx';

const customerNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile',   label: 'Profile',   icon: User2 },
];

const adminNav = [
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = user?.role === 'Admin' ? [...customerNav, ...adminNav] : customerNav;

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const sidebarContent = (
    <aside className="w-64 bg-white flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-primary-900">AgriCore</span>
        </div>
        {/* Close button — visible on mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
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
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <Image src={user.avatar} alt="avatar" fill className="object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary-600">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 border-r border-gray-100">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative z-50 flex-shrink-0 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

