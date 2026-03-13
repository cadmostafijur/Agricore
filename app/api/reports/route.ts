import { requireAuth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    const auth = await requireAuth();
    const reports = await prisma.report.findMany({
      where: { user_id: auth.userId },
      include: { field: { select: { name: true, district: true } } },
      orderBy: { created_at: 'desc' },
    });
    return json({ success: true, data: { reports } });
  } catch (err) {
    return errorJson(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { title, type, field_id } = await req.json();
    if (!title) {
      return json({ success: false, message: 'Title is required.' }, { status: 400 });
    }
    const report = await prisma.report.create({
      data: {
        title,
        type: type ?? 'General',
        field_id: field_id ? Number(field_id) : null,
        user_id: auth.userId,
      },
    });
    return json({ success: true, data: { report } }, { status: 201 });
  } catch (err) {
    return errorJson(err);
  }
}
