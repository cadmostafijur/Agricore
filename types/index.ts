// ─── Domain types ─────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Customer';
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Auth state ───────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Form data ────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Generic API response wrapper ─────────────────────────────
export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
