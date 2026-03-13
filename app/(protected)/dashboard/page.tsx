'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Users, ShieldCheck, TrendingUp, BarChart2, ArrowRight, Sprout, MapPin, FileText, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

const stats = [
  {
    label: 'Total Fields',
    value: '—',
    icon: MapPin,
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    trend: null,
  },
  {
    label: 'Active Crops',
    value: '—',
    icon: Sprout,
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
    trend: null,
  },
  {
    label: 'Reports',
    value: '—',
    icon: FileText,
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    trend: null,
  },
  {
    label: 'Team Members',
    value: '—',
    icon: UserCheck,
    color: 'bg-violet-50 text-violet-600',
    border: 'border-violet-100',
    trend: null,
  },
];

const quickActions = [
  { label: 'Add New Field', icon: MapPin, href: '#', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
  { label: 'Plant a Crop', icon: Sprout, href: '#', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
  { label: 'View Reports', icon: BarChart2, href: '#', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
  { label: 'Invite Member', icon: Users, href: '#', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-7 text-white shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-14 -right-4 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-32 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
            {user?.avatar ? (
              <Image src={user.avatar} alt="avatar" fill className="object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-primary-200 text-sm font-medium">Welcome back 👋</p>
            <h2 className="text-2xl font-bold truncate mt-0.5">{user?.name ?? 'User'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={clsx(
                  'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                  user?.role === 'Admin'
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-white/20 text-white'
                )}
              >
                {user?.role === 'Admin' && <ShieldCheck className="w-3 h-3" />}
                {user?.role === 'Customer' && <Leaf className="w-3 h-3" />}
                {user?.role}
              </span>
              <span className="text-primary-300 text-xs">•</span>
              <span className="text-primary-200 text-xs truncate">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin shortcut */}
      {user?.role === 'Admin' && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-yellow-900">Admin Panel Access</p>
            <p className="text-sm text-yellow-700 mt-0.5">You have administrator privileges. Manage users, roles, and system settings.</p>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-xl hover:bg-yellow-600 transition-colors flex-shrink-0 shadow-sm"
          >
            Open Admin <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, border }) => (
            <div
              key={label}
              className={clsx(
                'bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-default',
                border
              )}
            >
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions + Account Info side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <Link
                key={label}
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-colors group',
                  color
                )}
              >
                <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Your Account</h3>
          <div className="space-y-4">
            {[
              { label: 'Email', value: user?.email },
              { label: 'Role', value: user?.role },
              {
                label: 'Member since',
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—',
              },
              { label: 'User ID', value: `#${user?.id}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
                <span className="text-sm font-semibold text-gray-700 truncate max-w-[60%] text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
