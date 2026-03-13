'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
import { getApiError } from '@/contexts/AuthContext';
import {
  Trash2, Search, RefreshCw, Users, UserCheck, ShieldCheck,
  MapPin, Sprout, FileText, AlertTriangle, CheckCircle, AlertCircle,
  BarChart2,
} from 'lucide-react';
import clsx from 'clsx';

interface DistrictStat {
  district: string;
  fields: number;
  activeCrops: number;
  reports: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface AdminStats {
  totalUsers: number;
  adminCount: number;
  customerCount: number;
  totalFields: number;
  totalCrops: number;
  totalReports: number;
  districtStats: DistrictStat[];
}

const riskConfig = {
  Low:    { color: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-400', icon: CheckCircle,   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Medium: { color: 'bg-amber-100 text-amber-700',     bar: 'bg-amber-400',   icon: AlertCircle,   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  High:   { color: 'bg-red-100 text-red-700',         bar: 'bg-red-400',     icon: AlertTriangle, badge: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AdminPage() {
  const [users,      setUsers]      = useState<User[]>([]);
  const [stats,      setStats]      = useState<AdminStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [deleting,   setDeleting]   = useState<number | null>(null);
  const [activeTab,  setActiveTab]  = useState<'users' | 'risk'>('users');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get<{ success: boolean; data: { users: User[] } }>('/admin/users');
      setUsers(data.data.users);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get<{ success: boolean; data: AdminStats }>('/admin/stats');
      setStats(data.data);
    } catch {
      // stats optional
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      setDeleting(id);
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount    = users.filter((u) => u.role === 'Admin').length;
  const customerCount = users.filter((u) => u.role === 'Customer').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage users and monitor district activity</p>
        </div>
        <button
          onClick={() => { fetchUsers(); fetchStats(); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Users',   value: users.length,          icon: Users,    color: 'bg-blue-50 text-blue-600',    border: 'border-blue-100' },
          { label: 'Admins',        value: adminCount,             icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
          { label: 'Customers',     value: customerCount,          icon: UserCheck, color: 'bg-green-50 text-green-600',  border: 'border-green-100' },
          { label: 'Total Fields',  value: stats?.totalFields  ?? '—', icon: MapPin,   color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'Active Crops',  value: stats?.totalCrops   ?? '—', icon: Sprout,   color: 'bg-teal-50 text-teal-600',   border: 'border-teal-100' },
          { label: 'Reports',       value: stats?.totalReports ?? '—', icon: FileText, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={clsx('bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-2', border)}>
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['users', 'risk'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-2 text-sm font-medium rounded-lg transition-colors capitalize',
              activeTab === tab
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'users' ? '👥 Users' : '🗺️ District Risk Zones'}
          </button>
        ))}
      </div>

      {/* ── Users Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="text-base font-semibold text-gray-800">All Users</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {error && <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>}

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading users…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">#{u.id}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-5 py-3 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={clsx('inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          u.role === 'Admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800')}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deleting === u.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── District Risk Zones Tab ─────────────────────────────────────── */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-1">
              <BarChart2 className="w-5 h-5 text-slate-300" />
              <h2 className="text-base font-semibold">District Risk Assessment</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Risk score is calculated from report frequency relative to field count. Higher activity signals potential crop stress.
            </p>
            <div className="flex gap-4 mt-4 text-xs">
              {(['Low', 'Medium', 'High'] as const).map((level) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className={clsx('w-2.5 h-2.5 rounded-full', riskConfig[level].bar)} />
                  <span className="text-slate-300">{level} Risk</span>
                </div>
              ))}
            </div>
          </div>

          {statsLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400 text-sm">
              Loading district data…
            </div>
          ) : !stats?.districtStats?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
              <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No district data yet. Data appears when customers add fields.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.districtStats.map((d) => {
                const cfg = riskConfig[d.riskLevel];
                const RiskIcon = cfg.icon;
                return (
                  <div key={d.district} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{d.district}</p>
                          <p className="text-xs text-gray-400">{d.fields} field{d.fields !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.badge)}>
                        <RiskIcon className="w-3 h-3" />
                        {d.riskLevel}
                      </span>
                    </div>

                    {/* Risk bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Risk Score</span>
                        <span className="font-semibold text-gray-600">{d.riskScore}/100</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all', cfg.bar)}
                          style={{ width: `${d.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Fields',      value: d.fields,      icon: MapPin,   color: 'text-emerald-500' },
                        { label: 'Active Crops', value: d.activeCrops, icon: Sprout,   color: 'text-blue-500' },
                        { label: 'Reports',      value: d.reports,     icon: FileText, color: 'text-amber-500' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <Icon className={clsx('w-3.5 h-3.5 mx-auto mb-1', color)} />
                          <p className="text-base font-bold text-gray-700">{value}</p>
                          <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get<{ success: boolean; data: { users: User[] } }>(
        '/admin/users'
      );
      setUsers(data.data.users);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      setDeleting(id);
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const customerCount = users.filter((u) => u.role === 'Customer').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Admins', value: adminCount, icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Customers', value: customerCount, icon: UserCheck, color: 'bg-green-50 text-green-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
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

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-base font-semibold text-gray-800">All Users</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50"
            >
              <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">#{u.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={clsx(
                          'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          u.role === 'Admin'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-primary-100 text-primary-800'
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === u.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
