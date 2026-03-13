import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as userService from '../services/user.service';

// ─── GET /api/users/profile ───────────────────────────────────
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.user!.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/profile ───────────────────────────────────
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email } = req.body as { name?: string; email?: string };
    const user = await userService.updateUser(req.user!.userId, { name, email });
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────
export const getAllUsers = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: { users, total: users.length } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID.' });
      return;
    }
    const user = await userService.getUserById(id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID.' });
      return;
    }

    // Prevent admin from deleting themselves
    if (id === req.user!.userId) {
      res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
      return;
    }

    const result = await userService.deleteUser(id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
