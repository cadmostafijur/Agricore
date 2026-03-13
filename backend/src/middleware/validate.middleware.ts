import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

/**
 * Middleware factory: validates req.body against the provided Joi schema.
 * Returns 400 with a structured error list on failure.
 */
export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.context?.key ?? 'unknown',
        message: detail.message.replace(/['"]/g, ''),
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};
