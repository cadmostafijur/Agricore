import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Factory: returns middleware that only allows the listed roles.
 * Must be used AFTER the authenticate middleware.
 */
export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.roleName)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
      });
      return;
    }

    next();
  };
};

/** Shorthand: Admin-only routes */
export const requireAdmin = requireRole('Admin');

/** Shorthand: Both Admin and Customer */
export const requireCustomer = requireRole('Customer', 'Admin');
