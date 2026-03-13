import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth-jwt';
import { json, errorJson } from '@/app/api/_utils/response';

const bodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
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

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const customerRole = await prisma.role.findUnique({ where: { role_name: 'Customer' } });
    if (!customerRole) {
      return json(
        { success: false, message: 'Roles not initialised. Run the database seed.' },
        { status: 500 }
      );
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashedPassword, role_id: customerRole.id },
      include: { role: true },
    });

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
      { success: true, message: 'Account created successfully.', data: { user: sanitiseUser(user) } },
      { status: 201, headers: { 'Set-Cookie': cookie } }
    );
  } catch (e) {
    return errorJson(e);
  }
}

