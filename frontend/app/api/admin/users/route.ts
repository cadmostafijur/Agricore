import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { created_at: 'desc' },
    });

    return json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role.role_name,
          avatar: u.avatar,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
        })),
        total: users.length,
      },
    });
  } catch (e) {
    return errorJson(e);
  }
}

