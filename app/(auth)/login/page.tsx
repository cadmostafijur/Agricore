import { Suspense } from 'react';
import LoginForm from '@/components/forms/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In — AgriCore' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
