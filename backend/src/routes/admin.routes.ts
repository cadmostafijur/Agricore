import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// All admin routes require authentication AND the Admin role
router.use(authenticate, requireAdmin);

// ─── Admin User Management ────────────────────────────────────
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.delete('/users/:id', userController.deleteUser);

export default router;
