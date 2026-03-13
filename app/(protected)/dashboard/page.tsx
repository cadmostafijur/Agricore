import { getAuthUser } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { Leaf, ShieldCheck, Sprout, FileText, Bell, Users, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export default async function DashboardPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      crop_reports: { orderBy: { created_at: 'desc' }, take: 5 },
      notifications: { orderBy: { created_at: 'desc' }, take: 5 },
    },
  });
  if (!user) return null;

  const activeReports = user.crop_reports.filter((r) => r.status !== 'Rejected');
  const pendingReports = user.crop_reports.filter((r) => r.status === 'Pending');

  const initials =
    user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '?';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-7 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-14 -right-4 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
            {user.avatar ? (
              <Image src={user.avatar} alt="avatar" fill className="object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary-200 text-sm font-medium">Welcome back 👋</p>
            <h2 className="text-2xl font-bold truncate mt-0.5">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={clsx(
                  'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                  auth.roleName === 'Admin' ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'
                )}
              >
                {auth.roleName === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                {auth.roleName}
              </span>
              <span className="text-primary-300 text-xs">•</span>
              <span className="text-primary-200 text-xs truncate">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary-500" />
          Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'My Crop Reports',
              value: user.crop_reports.length,
              icon: FileText,
              color: 'bg-amber-50 text-amber-600',
              border: 'border-amber-100',
            },
            {
              label: 'Active Reports',
              value: activeReports.length,
              icon: Sprout,
              color: 'bg-emerald-50 text-emerald-600',
              border: 'border-emerald-100',
            },
            {
              label: 'Pending Reviews',
              value: pendingReports.length,
              icon: ShieldCheck,
              color: 'bg-blue-50 text-blue-600',
              border: 'border-blue-100',
            },
            {
              label: 'Unread Notifications',
              value: user.notifications.filter((n) => !n.read).length,
              icon: Bell,
              color: 'bg-violet-50 text-violet-600',
              border: 'border-violet-100',
            },
          ].map(({ label, value, icon: Icon, color, border }) => (
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

      {/* Reports + notifications + account */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My crop reports */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            My Crop Reports
          </h3>
          {user.crop_reports.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              You haven&apos;t submitted any crop reports yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50 text-sm">
              {user.crop_reports.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-500">
                      {r.crop_name} · {r.district} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      r.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : r.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications + account */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-500" /> Notifications
            </h3>
            {user.notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                You have no notifications yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {user.notifications.map((n) => (
                  <li
                    key={n.id}
                    className={clsx(
                      'p-3 rounded-xl border text-xs',
                      n.read ? 'bg-white border-gray-100' : 'bg-violet-50 border-violet-100'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">{n.title}</p>
                        <p className="text-gray-600 mt-0.5">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Account Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email', value: user.email },
                { label: 'Role', value: auth.roleName },
                {
                  label: 'Member since',
                  value: new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                },
                { label: 'User ID', value: `#${user.id}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 truncate max-w-[60%] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

