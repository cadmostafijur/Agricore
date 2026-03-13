import { requireAuth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    const auth = await requireAuth();
    const fields = await prisma.field.findMany({
      where: { user_id: auth.userId },
      include: { crops: true, crop_reports: true },
      orderBy: { created_at: 'desc' },
    });
    return json({ success: true, data: { fields } });
  } catch (err) {
    return errorJson(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { name, area_ha, district } = await req.json();
    if (!name || !district) {
      return json({ success: false, message: 'Name and district are required.' }, { status: 400 });
    }
    const field = await prisma.field.create({
      data: { name, area_ha: area_ha ? Number(area_ha) : null, district, user_id: auth.userId },
    });
    return json({ success: true, data: { field } }, { status: 201 });
  } catch (err) {
    return errorJson(err);
  }
}
