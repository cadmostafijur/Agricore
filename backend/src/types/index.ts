import { Request } from 'express';

// ─────────────────────────────────────────────────────────────
// JWT Payload stored in the token
// ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
}

// ─────────────────────────────────────────────────────────────
// Express Request extended with authenticated user
// ─────────────────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─────────────────────────────────────────────────────────────
// Sanitised user object returned in API responses
// ─────────────────────────────────────────────────────────────
export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}
