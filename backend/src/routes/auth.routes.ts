import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

// ─── Email / Password Auth ────────────────────────────────────
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// ─── Get current authenticated user ──────────────────────────
router.get('/me', authenticate, authController.getMe);

// ─── Google OAuth 2.0 ────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  authController.googleCallback
);

export default router;
