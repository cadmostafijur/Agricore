import { requireCustomer } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

// GET /api/reports - list current user's crop reports
export async function GET() {
  try {
    const auth = await requireCustomer();
    const reports = await prisma.cropReport.findMany({
      where: { user_id: auth.userId },
      include: { field: { select: { name: true, district: true } } },
      orderBy: { created_at: 'desc' },
    });
    return json({ success: true, data: { reports } });
  } catch (err) {
    return errorJson(err);
  }
}

// POST /api/reports - create a new crop report
export async function POST(req: Request) {
  try {
    const auth = await requireCustomer();
    const { title, crop_name, district, description, type, field_id } = await req.json();

    if (!title || !crop_name || !district) {
      return json({ success: false, message: 'Title, crop name, and district are required.' }, { status: 400 });
    }

    const report = await prisma.cropReport.create({
      data: {
        title,
        crop_name,
        district,
        description: description ?? null,
        type: type ?? 'General',
        status: 'Pending',
        field_id: field_id ? Number(field_id) : null,
        user_id: auth.userId,
      },
    });

    await prisma.activityLog.create({
      data: {
        user_id: auth.userId,
        action: 'Submitted crop report',
        entity: 'CropReport',
        entity_id: report.id,
        metadata: { title, type: type ?? 'General' },
      },
    });

    return json({ success: true, data: { report } }, { status: 201 });
  } catch (err) {
    return errorJson(err);
  }
}
