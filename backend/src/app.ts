import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import passportConfig from './config/passport';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// ── Trust proxy (required for rate limiting behind reverse proxy) ────
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────
const corsOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  // In development allow any localhost origin regardless of port
  if (!origin || process.env.NODE_ENV !== 'production') {
    return callback(null, true);
  }
  if (origin === process.env.FRONTEND_URL) {
    return callback(null, true);
  }
  callback(new Error(`CORS: origin '${origin}' is not allowed`));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate limiting on auth endpoints ──────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 attempts per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Passport (no sessions — JWT only) ────────────────────────────────
app.use(passportConfig.initialize());

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AgriCore API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ── Error handling ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
