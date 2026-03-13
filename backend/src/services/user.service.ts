import { Prisma } from '@prisma/client';
import prisma from '../config/database';

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

// ─── Get single user ──────────────────────────────────────────
export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404, isOperational: true });
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.role_name,
    avatar: user.avatar,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

// ─── Get all users (admin) ────────────────────────────────────
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { created_at: 'desc' },
  });

  return users.map((u: UserWithRole) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.role_name,
    avatar: u.avatar,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  }));
};

// ─── Update user profile ──────────────────────────────────────
export const updateUser = async (id: number, data: { name?: string; email?: string }) => {
  if (data.email) {
    const conflict = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (conflict) {
      throw Object.assign(new Error('Email is already in use.'), {
        statusCode: 409,
        isOperational: true,
      });
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { ...data },
    include: { role: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.role_name,
    avatar: user.avatar,
    updatedAt: user.updated_at,
  };
};

// ─── Delete user (admin) ──────────────────────────────────────
export const deleteUser = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404, isOperational: true });
  }

  await prisma.user.delete({ where: { id } });
  return { message: 'User deleted successfully.' };
};
