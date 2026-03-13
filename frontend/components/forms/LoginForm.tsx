'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginInput } from '@/lib/validators';
import { useAuth, getApiError } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [oauthError] = useState(searchParams.get('error') === 'google_auth_failed');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    try {
      setServerError('');
      await login(values.email, values.password);
      router.push(redirectTo);
    } catch (err) {
      setServerError(getApiError(err));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 mb-6">Sign in to your AgriCore account</p>

      {oauthError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Google sign-in failed. Please try again or use email/password.
        </div>
      )}

      {serverError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400">
          <span className="px-3 bg-white">or continue with</span>
        </div>
      </div>

      {/* Google OAuth */}
      <a
        href={`${API_URL}/auth/google`}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg viewBox="0 0 48 48" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.5-1.45-.79-3-.79-4.59s.27-3.14.79-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
        </svg>
        Sign in with Google
      </a>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
