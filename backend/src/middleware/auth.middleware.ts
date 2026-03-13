import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware: verifies the HttpOnly JWT cookie and attaches
 * the decoded payload to req.user.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.agricore_token as string | undefined;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};
