import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as string) || '7d';

/**
 * Signs and returns a JWT containing the provided payload.
 */
export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verifies a JWT and returns its decoded payload.
 * Throws if the token is invalid or expired.
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
