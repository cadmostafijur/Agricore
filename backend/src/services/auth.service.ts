import prisma from '../config/database';
import { hashPassword, comparePasswords } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { JwtPayload } from '../types';

// ─── Register ────────────────────────────────────────────────
export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = Object.assign(new Error('An account with this email already exists.'), {
      statusCode: 409,
      isOperational: true,
    });
    throw err;
  }

  const customerRole = await prisma.role.findUnique({ where: { role_name: 'Customer' } });
  if (!customerRole) {
    throw Object.assign(new Error('Roles not initialised. Run the database seed.'), {
      statusCode: 500,
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role_id: customerRole.id },
    include: { role: true },
  });

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    roleId: user.role_id,
    roleName: user.role.role_name,
  };

  return {
    user: sanitiseUser(user),
    token: generateToken(payload),
  };
};

// ─── Login ───────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  // Intentionally vague error to prevent user enumeration
  if (!user || !user.password) {
    throw Object.assign(new Error('Invalid email or password.'), {
      statusCode: 401,
      isOperational: true,
    });
  }

  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password.'), {
      statusCode: 401,
      isOperational: true,
    });
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    roleId: user.role_id,
    roleName: user.role.role_name,
  };

  return {
    user: sanitiseUser(user),
    token: generateToken(payload),
  };
};

// ─── OAuth token helper ───────────────────────────────────────
export const generateTokenForOAuthUser = (user: {
  id: number;
  email: string;
  role_id: number;
  role: { role_name: string };
}): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    roleId: user.role_id,
    roleName: user.role.role_name,
  };
  return generateToken(payload);
};

// ─── Helper: strip sensitive fields ──────────────────────────
const sanitiseUser = (user: {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  created_at: Date;
  role: { role_name: string };
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role.role_name,
  avatar: user.avatar,
  createdAt: user.created_at,
});
