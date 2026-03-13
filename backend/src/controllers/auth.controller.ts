import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  generateTokenForOAuthUser,
} from '../services/auth.service';
import { getUserById } from '../services/user.service';
import { AuthenticatedRequest } from '../types';

// Shared cookie options
const cookieOptions = (res: Response) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ─── POST /api/auth/register ──────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    const { user, token } = await registerUser(name, email, password);

    res.cookie('agricore_token', token, cookieOptions(res));

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, token } = await loginUser(email, password);

    res.cookie('agricore_token', token, cookieOptions(res));

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('agricore_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me ─────────────────────────────────────────
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserById(req.user!.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/google/callback ───────────────────────────
export const googleCallback = (req: Request, res: Response): void => {
  try {
    const oauthUser = req.user as {
      id: number;
      email: string;
      role_id: number;
      role: { role_name: string };
    };

    const token = generateTokenForOAuthUser(oauthUser);
    res.cookie('agricore_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};
