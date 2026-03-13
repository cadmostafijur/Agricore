'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { signupSchema, SignupInput } from '@/lib/validators';
import { useAuth, getApiError } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema), mode: 'onChange' });

  const passwordValue = watch('password', '');

  const onSubmit = async (values: SignupInput) => {
    try {
      setServerError('');
      await signup(values.name, values.email, values.password);
      router.push('/dashboard');
    } catch (err) {
      setServerError(getApiError(err));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">Join AgriCore to manage your agricultural data</p>

      {serverError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            autoComplete="new-password"
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

          {/* Password strength checklist */}
          {passwordValue && (
            <ul className="mt-2 space-y-1">
              {passwordRules.map(({ label, test }) => {
                const passed = test(passwordValue);
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-1.5 text-xs ${
                      passed ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${passed ? '' : 'opacity-30'}`} />
                    {label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          autoComplete="new-password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Create Account
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
        Sign up with Google
      </a>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
