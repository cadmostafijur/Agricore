import { requireAdmin } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    await requireAdmin();
    const reports = await prisma.cropReport.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return json({ success: true, data: { reports } });
  } catch (err) {
    return errorJson(err);
  }
}

