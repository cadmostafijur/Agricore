import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth-jwt';
import { json, errorJson } from '@/app/api/_utils/response';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const sanitiseUser = (user: {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  created_at: Date;
  role: { role_name: string };
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role.role_name,
  avatar: user.avatar,
  createdAt: user.created_at,
});

export async function POST(req: Request) {
  try {
    const input = bodySchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: input.email }, include: { role: true } });
    if (!user || !user.password) {
      return json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      return json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role.role_name,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const cookie = [
      `agricore_token=${token}`,
      'Path=/',
      'HttpOnly',
      'Max-Age=604800',
      `SameSite=${isProd ? 'Lax' : 'Lax'}`,
      isProd ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    return json(
      { success: true, message: 'Login successful.', data: { user: sanitiseUser(user) } },
      { status: 200, headers: { 'Set-Cookie': cookie } }
    );
  } catch (e) {
    return errorJson(e);
  }
}

