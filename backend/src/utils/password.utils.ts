import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Hash a plain-text password with bcrypt. */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/** Compare a plain-text password against a bcrypt hash. */
export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
