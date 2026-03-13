import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

// All routes below require a valid JWT
router.use(authenticate);

// ─── User Profile ─────────────────────────────────────────────
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

export default router;
