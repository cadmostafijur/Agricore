'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Users, ShieldCheck, TrendingUp, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const stats = [
  { label: 'Total Fields', value: '—', icon: Leaf, color: 'bg-green-100 text-green-700' },
  { label: 'Active Crops', value: '—', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  { label: 'Reports', value: '—', icon: BarChart2, color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Team Members', value: '—', icon: Users, color: 'bg-purple-100 text-purple-700' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow">
        <p className="text-primary-100 text-sm font-medium mb-1">
          Welcome back,
        </p>
        <h2 className="text-2xl font-bold mb-0.5">{user?.name ?? 'User'}</h2>
        <span
          className={clsx(
            'inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-2',
            user?.role === 'Admin'
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-primary-400 text-white'
          )}
        >
          {user?.role}
        </span>
      </div>

      {/* Admin shortcut */}
      {user?.role === 'Admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">Admin Panel Access</p>
            <p className="text-sm text-yellow-600">You have administrator privileges. Manage all users from the admin panel.</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex-shrink-0"
          >
            Open Admin
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={clsx('p-3 rounded-lg', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Your Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email</span>
            <p className="font-medium text-gray-800 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Role</span>
            <p className="font-medium text-gray-800 mt-0.5">{user?.role}</p>
          </div>
          <div>
            <span className="text-gray-500">Member since</span>
            <p className="font-medium text-gray-800 mt-0.5">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">User ID</span>
            <p className="font-medium text-gray-800 mt-0.5">#{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
