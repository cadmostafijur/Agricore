import Link from 'next/link';
import { Leaf, ShieldCheck, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary-600 shadow-lg">
          <Leaf className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-5xl font-extrabold text-primary-900 tracking-tight mb-4">
          AgriCore
        </h1>
        <p className="text-xl text-primary-700 max-w-xl mb-10">
          The secure, role-based agricultural management platform built for farmers, agronomists,
          and administrators.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-700 transition-colors shadow"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl border-2 border-primary-600 text-primary-700 font-semibold text-base hover:bg-primary-50 transition-colors"
          >
            Create Account
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            {
              icon: <ShieldCheck className="w-7 h-7 text-primary-600" />,
              title: 'JWT Secured',
              desc: 'HttpOnly cookie-based JWT authentication with bcrypt password hashing.',
            },
            {
              icon: <Users className="w-7 h-7 text-primary-600" />,
              title: 'Role-Based Access',
              desc: 'Granular RBAC — Admins manage users while Customers access their own data.',
            },
            {
              icon: <Leaf className="w-7 h-7 text-primary-600" />,
              title: 'Google OAuth',
              desc: 'One-click sign-in with Google. New accounts are auto-provisioned.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl shadow p-6 text-left">
              <div className="mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
