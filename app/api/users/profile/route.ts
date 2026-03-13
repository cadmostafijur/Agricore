import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { json, errorJson } from '@/app/api/_utils/response';

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    const user = await prisma.user.findUnique({ where: { id: auth.userId }, include: { role: true } });
    if (!user) return json({ success: false, message: 'User not found.' }, { status: 404 });

    return json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.role_name,
          avatar: user.avatar,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (e) {
    return errorJson(e);
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuth();
    const input = updateSchema.parse(await req.json());

    if (input.email) {
      const conflict = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id: auth.userId } },
      });
      if (conflict) {
        return json({ success: false, message: 'Email is already in use.' }, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { ...input },
      include: { role: true },
    });

    return json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.role_name,
          avatar: user.avatar,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (e) {
    return errorJson(e);
  }
}

