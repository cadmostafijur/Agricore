'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
import { getApiError } from '@/contexts/AuthContext';
import { Trash2, Search, RefreshCw, Users, UserCheck, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

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
