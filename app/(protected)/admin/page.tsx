 'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminStats, CropReport, User } from '@/types';
import { getApiError } from '@/contexts/AuthContext';
import {
  Trash2,
  Search,
  RefreshCw,
  Users,
  UserCheck,
  ShieldCheck,
  MapPin,
  Sprout,
  FileText,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Check,
  X as XIcon,
} from 'lucide-react';
import clsx from 'clsx';

const riskConfig = {
  Low: {
    color: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-400',
    icon: CheckCircle,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Medium: {
    color: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-400',
    icon: AlertCircle,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  High: {
    color: 'bg-red-100 text-red-700',
    bar: 'bg-red-400',
    icon: AlertTriangle,
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
} as const;

type ReportFilter = 'all' | 'active' | 'pending' | 'approved' | 'rejected';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<CropReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'risk'>('overview');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);

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
      // stats are optional — show UI without crashing
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const { data } = await api.get<{ success: boolean; data: { reports: CropReport[] } }>(
        '/admin/reports'
      );
      setReports(data.data.reports);
    } catch {
      // ignore; table will just be empty
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchReports();
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

  const updateReportStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      setUpdatingReportId(id);
      await api.patch(`/admin/reports/${id}`, { status });
      // refresh reports + stats to reflect new status
      await Promise.all([fetchReports(), fetchStats()]);
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setUpdatingReportId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor platform health, manage users, and review crop activity.
          </p>
        </div>
        <button
          onClick={() => {
            fetchUsers();
            fetchStats();
          }}
          disabled={loading || statsLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={clsx('w-4 h-4', (loading || statsLoading) && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Top summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Admins', value: adminCount, icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
          { label: 'Farmers', value: customerCount, icon: UserCheck, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
          { label: 'Crop Reports', value: stats?.totalCropReports ?? '—', icon: FileText, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
          { label: 'Active Reports', value: stats?.activeReports ?? '—', icon: BarChart2, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'Reports Today', value: stats?.reportsToday ?? '—', icon: Sprout, color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
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
        {(['overview', 'users', 'reports', 'risk'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-2 text-sm font-medium rounded-lg transition-colors capitalize',
              activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'overview'
              ? '📊 Overview'
              : tab === 'users'
              ? '👥 Users'
              : tab === 'reports'
              ? '📄 Reports'
              : '🗺️ District Risk'}
          </button>
        ))}
      </div>

      {/* Overview: charts + recent activity */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Reports by day / type */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary-500" />
                Crop Reports (last 7 days)
              </h2>
            </div>
            {statsLoading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading statistics…</p>
            ) : !stats?.reportsByDay?.length ? (
              <p className="text-sm text-gray-400 py-8 text-center">No reports yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.reportsByDay.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-500">{d.date}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${Math.min(100, d.count * 10)}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs text-gray-600 text-right">{d.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
            {statsLoading ? (
              <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
            ) : !stats?.recentActivity?.length ? (
              <p className="text-sm text-gray-400 py-4 text-center">No activity yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {stats.recentActivity.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{a.action}</p>
                      {a.entity && (
                        <p className="text-xs text-gray-500">
                          {a.entity}
                          {a.entity_id ? ` #${a.entity_id}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Reports table */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Crop Reports
              </h2>
              <p className="text-xs text-gray-400">
                {reports.length} total · {stats?.activeReports ?? 0} active ·{' '}
                {stats?.pendingReports ?? 0} pending
              </p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 text-xs">
              {(
                [
                  ['all', 'All'],
                  ['active', 'Active'],
                  ['pending', 'Pending'],
                  ['approved', 'Approved'],
                  ['rejected', 'Rejected'],
                ] as [ReportFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReportFilter(value)}
                  className={clsx(
                    'px-3 py-1 rounded-full font-medium transition-colors',
                    reportFilter === value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {reportsLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading reports…</div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No crop reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Farmer</th>
                    <th className="px-5 py-3 font-medium">Crop / District</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports
                    .filter((r) => {
                      if (reportFilter === 'all') return true;
                      if (reportFilter === 'active') return r.status !== 'Rejected';
                      return r.status === reportFilter[0].toUpperCase() + reportFilter.slice(1);
                    })
                    .map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">#{r.id}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{r.title}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {r.user?.name ?? '—'}
                        <div className="text-[11px] text-gray-400">{r.user?.email}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {r.crop_name}
                        <div className="text-[11px] text-gray-400">{r.district}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{r.type}</td>
                      <td className="px-5 py-3">
                        <span
                          className={clsx(
                            'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
                            r.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : r.status === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right space-x-1">
                        {r.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateReportStatus(r.id, 'Approved')}
                              disabled={updatingReportId === r.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateReportStatus(r.id, 'Rejected')}
                              disabled={updatingReportId === r.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XIcon className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users table */}
      {activeTab === 'users' && (
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
      )}

      {/* District risk view */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-1">
              <BarChart2 className="w-5 h-5 text-slate-300" />
              <h2 className="text-base font-semibold">District Risk Assessment</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Risk score is calculated from report frequency relative to field count. Higher
              activity signals potential crop stress.
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
              <p className="text-gray-400 text-sm">
                No district data yet. Data appears when farmers add fields and reports.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.districtStats.map((d) => {
                const cfg = riskConfig[d.riskLevel];
                const RiskIcon = cfg.icon;
                return (
                  <div
                    key={d.district}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{d.district}</p>
                          <p className="text-xs text-gray-400">
                            {d.fields} field{d.fields !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border',
                          cfg.badge
                        )}
                      >
                        <RiskIcon className="w-3 h-3" />
                        {d.riskLevel}
                      </span>
                    </div>

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

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Fields', value: d.fields, icon: MapPin, color: 'text-emerald-500' },
                        {
                          label: 'Reports',
                          value: d.reports,
                          icon: FileText,
                          color: 'text-amber-500',
                        },
                        {
                          label: 'Active Reports',
                          value: d.reports, // simplified metric
                          icon: Sprout,
                          color: 'text-blue-500',
                        },
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
