import { requireAuth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    const auth = await requireAuth();
    const members = await prisma.teamMember.findMany({
      where: { owner_id: auth.userId },
      orderBy: { created_at: 'desc' },
    });
    return json({ success: true, data: { members } });
  } catch (err) {
    return errorJson(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { name, email, role } = await req.json();
    if (!name || !email) {
      return json({ success: false, message: 'Name and email are required.' }, { status: 400 });
    }
    const member = await prisma.teamMember.create({
      data: { owner_id: auth.userId, name, email, role: role ?? 'Member' },
    });
    return json({ success: true, data: { member } }, { status: 201 });
  } catch (err) {
    return errorJson(err);
  }
}
