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

export interface CropReport {
  id: number;
  title: string;
  crop_name: string;
  district: string;
  description?: string | null;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  field_id?: number | null;
  field?: { name: string; district: string } | null;
  user_id: number;
  user?: { name: string; email: string };
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number | null;
  user?: { name: string; email: string } | null;
  action: string;
  entity?: string | null;
  entity_id?: number | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalFarmers: number;
  totalAdmins: number;
  totalFields: number;
  totalCropReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  activeReports: number;
  reportsToday: number;
  recentActivity: ActivityLog[];
  reportsByDay: { date: string; count: number }[];
  reportsByType: { type: string; count: number }[];
  reportsByStatus: { status: string; count: number }[];
  districtStats: {
    district: string;
    fields: number;
    reports: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    riskScore: number;
  }[];
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
