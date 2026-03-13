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
// Augment Express.User so req.user carries our JWT fields.
// This makes @types/passport's req.user compatible with JwtPayload.
// ─────────────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

// ─────────────────────────────────────────────────────────────
// Express Request extended with authenticated user
// (user property is already typed via Express.User augmentation above)
// ─────────────────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {}

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
