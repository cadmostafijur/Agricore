import { requireAuth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    const auth = await requireAuth();
    const fields = await prisma.field.findMany({ where: { user_id: auth.userId }, select: { id: true } });
    const fieldIds = fields.map((f) => f.id);
    const crops = await prisma.crop.findMany({
      where: { field_id: { in: fieldIds } },
      include: { field: { select: { name: true, district: true } } },
      orderBy: { planted_at: 'desc' },
    });
    return json({ success: true, data: { crops } });
  } catch (err) {
    return errorJson(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { name, field_id, status } = await req.json();
    if (!name || !field_id) {
      return json({ success: false, message: 'Name and field are required.' }, { status: 400 });
    }
    // verify field belongs to user
    const field = await prisma.field.findFirst({ where: { id: Number(field_id), user_id: auth.userId } });
    if (!field) return json({ success: false, message: 'Field not found.' }, { status: 404 });

    const crop = await prisma.crop.create({
      data: { name, field_id: Number(field_id), status: status ?? 'Active' },
    });
    return json({ success: true, data: { crop } }, { status: 201 });
  } catch (err) {
    return errorJson(err);
  }
}
