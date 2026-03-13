'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, getApiError } from '@/contexts/AuthContext';
import { updateProfileSchema, UpdateProfileInput } from '@/lib/validators';
import api from '@/lib/api';
import { User2, Mail, Shield, Calendar, Pencil, Check, X } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onCancel = () => {
    reset({ name: user?.name ?? '', email: user?.email ?? '' });
    setEditing(false);
    setServerError('');
  };

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      setServerError('');
      await api.put('/users/profile', values);
      await refreshUser();
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setServerError(getApiError(err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Avatar + identity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
          {user?.avatar ? (
            <Image src={user.avatar} alt="avatar" fill className="object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary-600">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span
            className={clsx(
              'inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2',
              user?.role === 'Admin'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-primary-100 text-primary-800'
            )}
          >
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800">Account Details</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
            <Check className="w-4 h-4" /> Profile updated successfully.
          </div>
        )}

        {serverError && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
            <X className="w-4 h-4" /> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="form-label">
              <User2 className="w-4 h-4 inline mr-1 text-gray-400" />
              Full Name
            </label>
            <input
              {...register('name')}
              disabled={!editing}
              className={clsx(
                'w-full px-4 py-2.5 rounded-lg border text-sm transition-colors',
                editing
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  : 'border-gray-100 bg-gray-50 text-gray-700',
                errors.name && 'border-red-400'
              )}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="form-label">
              <Mail className="w-4 h-4 inline mr-1 text-gray-400" />
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              disabled={!editing}
              className={clsx(
                'w-full px-4 py-2.5 rounded-lg border text-sm transition-colors',
                editing
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  : 'border-gray-100 bg-gray-50 text-gray-700',
                errors.email && 'border-red-400'
              )}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="form-label">
                <Shield className="w-4 h-4 inline mr-1 text-gray-400" />
                Role
              </label>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
                {user?.role}
              </p>
            </div>
            <div>
              <label className="form-label">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                Member Since
              </label>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
