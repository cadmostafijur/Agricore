import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';
import { json, errorJson } from '@/app/api/_utils/response';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number(params.id);
    if (!Number.isFinite(id)) return json({ success: false, message: 'Invalid user ID.' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
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

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const id = Number(params.id);
    if (!Number.isFinite(id)) return json({ success: false, message: 'Invalid user ID.' }, { status: 400 });

    if (id === admin.userId) {
      return json({ success: false, message: 'You cannot delete your own account.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return json({ success: false, message: 'User not found.' }, { status: 404 });

    await prisma.user.delete({ where: { id } });
    return json({ success: true, message: 'User deleted successfully.' }, { status: 200 });
  } catch (e) {
    return errorJson(e);
  }
}

