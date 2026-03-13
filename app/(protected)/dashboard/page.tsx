'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
  Leaf, Users, ShieldCheck, TrendingUp, BarChart2, ArrowRight,
  Sprout, MapPin, FileText, UserCheck, Plus, X, ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Field { id: number; name: string; district: string; area_ha?: number; crops: unknown[]; reports: unknown[] }
interface Crop  { id: number; name: string; status: string; field: { name: string; district: string } }
interface Report { id: number; title: string; type: string; created_at: string; field?: { name: string } }
interface TeamMember { id: number; name: string; email: string; role: string }

type ModalType = 'field' | 'crop' | 'report' | 'team' | null;

// ─── Simple modal wrapper ─────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Form field helper ────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const btnPrimary = 'w-full py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50';

export default function DashboardPage() {
  const { user } = useAuth();

  const [fields,  setFields]  = useState<Field[]>([]);
  const [crops,   setCrops]   = useState<Crop[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [team,    setTeam]    = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<ModalType>(null);
  const [saving,  setSaving]  = useState(false);

  // form state
  const [fieldForm,  setFieldForm]  = useState({ name: '', district: '', area_ha: '' });
  const [cropForm,   setCropForm]   = useState({ name: '', field_id: '' });
  const [reportForm, setReportForm] = useState({ title: '', type: 'General', field_id: '' });
  const [teamForm,   setTeamForm]   = useState({ name: '', email: '', role: 'Member' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [f, c, r, t] = await Promise.all([
        api.get<{ data: { fields: Field[] } }>('/fields'),
        api.get<{ data: { crops: Crop[] } }>('/crops'),
        api.get<{ data: { reports: Report[] } }>('/reports'),
        api.get<{ data: { members: TeamMember[] } }>('/team'),
      ]);
      setFields(f.data.data.fields);
      setCrops(c.data.data.crops);
      setReports(r.data.data.reports);
      setTeam(t.data.data.members);
    } catch {
      // silently fail - stats stay at 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const closeModal = () => setModal(null);

  const addField = async () => {
    if (!fieldForm.name || !fieldForm.district) return;
    setSaving(true);
    try {
      await api.post('/fields', fieldForm);
      await fetchAll();
      setFieldForm({ name: '', district: '', area_ha: '' });
      closeModal();
    } finally { setSaving(false); }
  };

  const addCrop = async () => {
    if (!cropForm.name || !cropForm.field_id) return;
    setSaving(true);
    try {
      await api.post('/crops', cropForm);
      await fetchAll();
      setCropForm({ name: '', field_id: '' });
      closeModal();
    } finally { setSaving(false); }
  };

  const addReport = async () => {
    if (!reportForm.title) return;
    setSaving(true);
    try {
      await api.post('/reports', reportForm);
      await fetchAll();
      setReportForm({ title: '', type: 'General', field_id: '' });
      closeModal();
    } finally { setSaving(false); }
  };

  const addTeamMember = async () => {
    if (!teamForm.name || !teamForm.email) return;
    setSaving(true);
    try {
      await api.post('/team', teamForm);
      await fetchAll();
      setTeamForm({ name: '', email: '', role: 'Member' });
      closeModal();
    } finally { setSaving(false); }
  };

  const activeCrops = crops.filter((c) => c.status === 'Active');

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  const stats = [
    {
      label: 'Total Fields', value: loading ? '…' : fields.length,
      icon: MapPin, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100',
      modal: 'field' as ModalType, recent: fields.slice(0, 2).map((f) => f.name),
    },
    {
      label: 'Active Crops', value: loading ? '…' : activeCrops.length,
      icon: Sprout, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100',
      modal: 'crop' as ModalType, recent: activeCrops.slice(0, 2).map((c) => c.name),
    },
    {
      label: 'Reports', value: loading ? '…' : reports.length,
      icon: FileText, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100',
      modal: 'report' as ModalType, recent: reports.slice(0, 2).map((r) => r.title),
    },
    {
      label: 'Team Members', value: loading ? '…' : team.length,
      icon: UserCheck, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100',
      modal: 'team' as ModalType, recent: team.slice(0, 2).map((m) => m.name),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-7 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-14 -right-4 w-64 h-64 bg-white/5 rounded-full" />
        <div className="relative flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
            {user?.avatar
              ? <Image src={user.avatar} alt="avatar" fill className="object-cover" />
              : <span className="text-2xl font-bold text-white">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary-200 text-sm font-medium">Welcome back 👋</p>
            <h2 className="text-2xl font-bold truncate mt-0.5">{user?.name ?? 'User'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                user?.role === 'Admin' ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white')}>
                {user?.role === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                {user?.role}
              </span>
              <span className="text-primary-300 text-xs">•</span>
              <span className="text-primary-200 text-xs truncate">{user?.email}</span>
            </div>
          </div>
          <button onClick={fetchAll} className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
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
            <p className="text-sm text-yellow-700 mt-0.5">Manage users, view district risk zones, and system settings.</p>
          </div>
          <Link href="/admin" className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-xl hover:bg-yellow-600 transition-colors flex-shrink-0 shadow-sm">
            Open Admin <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-500" /> Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, border, modal: m, recent }) => (
            <div key={label} className={clsx('bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow', border)}>
              <div className="flex items-start justify-between">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setModal(m)}
                  className={clsx('w-7 h-7 rounded-lg flex items-center justify-center transition-colors', color, 'opacity-70 hover:opacity-100')}
                  title={`Add ${label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
              {recent.length > 0 && (
                <ul className="space-y-0.5">
                  {recent.map((r, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-center gap-1 truncate">
                      <ChevronRight className="w-3 h-3 flex-shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity + Account Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent crops */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-blue-500" /> Recent Crops
            </h3>
            <button onClick={() => setModal('crop')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {activeCrops.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No active crops yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {activeCrops.slice(0, 5).map((c) => (
                <li key={c.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.field.name} · {c.field.district}</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" /> Your Account
          </h3>
          <div className="space-y-0">
            {[
              { label: 'Email',        value: user?.email },
              { label: 'Role',         value: user?.role },
              { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'User ID',      value: `#${user?.id}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
                <span className="text-sm font-semibold text-gray-700 truncate max-w-[60%] text-right">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-4 h-4 text-gray-300" />
              <p className="text-xs text-gray-400">
                {fields.length} field{fields.length !== 1 ? 's' : ''} · {activeCrops.length} active crop{activeCrops.length !== 1 ? 's' : ''} · {reports.length} report{reports.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {modal === 'field' && (
        <Modal title="Add New Field" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Field Name"><input className={inputCls} placeholder="e.g. North Paddock" value={fieldForm.name} onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })} /></Field>
            <Field label="District"><input className={inputCls} placeholder="e.g. Sylhet" value={fieldForm.district} onChange={(e) => setFieldForm({ ...fieldForm, district: e.target.value })} /></Field>
            <Field label="Area (hectares, optional)"><input className={inputCls} type="number" placeholder="e.g. 2.5" value={fieldForm.area_ha} onChange={(e) => setFieldForm({ ...fieldForm, area_ha: e.target.value })} /></Field>
            <button className={btnPrimary} disabled={saving} onClick={addField}>{saving ? 'Saving…' : 'Add Field'}</button>
          </div>
        </Modal>
      )}

      {modal === 'crop' && (
        <Modal title="Plant a Crop" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Crop Name"><input className={inputCls} placeholder="e.g. Rice" value={cropForm.name} onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })} /></Field>
            <Field label="Field">
              <select className={inputCls} value={cropForm.field_id} onChange={(e) => setCropForm({ ...cropForm, field_id: e.target.value })}>
                <option value="">Select a field…</option>
                {fields.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.district})</option>)}
              </select>
            </Field>
            {fields.length === 0 && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">Add a field first before planting crops.</p>}
            <button className={btnPrimary} disabled={saving || fields.length === 0} onClick={addCrop}>{saving ? 'Saving…' : 'Plant Crop'}</button>
          </div>
        </Modal>
      )}

      {modal === 'report' && (
        <Modal title="Create Report" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Report Title"><input className={inputCls} placeholder="e.g. Pest observation - June" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} /></Field>
            <Field label="Type">
              <select className={inputCls} value={reportForm.type} onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}>
                {['General', 'Soil', 'Pest', 'Weather', 'Harvest'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Field (optional)">
              <select className={inputCls} value={reportForm.field_id} onChange={(e) => setReportForm({ ...reportForm, field_id: e.target.value })}>
                <option value="">None</option>
                {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
            <button className={btnPrimary} disabled={saving} onClick={addReport}>{saving ? 'Saving…' : 'Create Report'}</button>
          </div>
        </Modal>
      )}

      {modal === 'team' && (
        <Modal title="Invite Team Member" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Name"><input className={inputCls} placeholder="Full name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Field>
            <Field label="Email"><input className={inputCls} type="email" placeholder="email@example.com" value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} /></Field>
            <Field label="Role">
              <select className={inputCls} value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}>
                {['Member', 'Manager', 'Viewer'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <button className={btnPrimary} disabled={saving} onClick={addTeamMember}>{saving ? 'Saving…' : 'Add Member'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

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
