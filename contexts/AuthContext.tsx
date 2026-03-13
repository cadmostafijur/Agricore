'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AxiosError } from 'axios';
import { User, AuthState } from '@/types';
import api from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /** Fetch the current user from the backend (validates the cookie) */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
      setState({ user: data.data.user, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/login', {
      email,
      password,
    });
    setState({ user: data.data.user, isLoading: false, isAuthenticated: true });
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/register', {
      name,
      email,
      password,
    });
    setState({ user: data.data.user, isLoading: false, isAuthenticated: true });
  };

  const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

/** Extract a human-readable error message from an Axios error */
export function getApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ message: string }> }
      | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(', ');
    if (data?.message) return data.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
