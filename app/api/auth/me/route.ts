import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    const auth = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { role: true },
    });

    if (!user) {
      return json({ success: false, message: 'User not found.' }, { status: 404 });
    }

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

