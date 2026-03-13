import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler. Operational (known) errors return their
 * message; unexpected errors return a generic 500 response.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;

  // Mask internal errors in production
  const message =
    isOperational || process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred. Please try again.';

  if (!isOperational) {
    console.error('[UnhandledError]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
  });
};

/** 404 handler for unknown routes */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};
