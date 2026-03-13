import { cookies } from 'next/headers';
import { verifyToken, type AgriCoreJWTPayload } from '@/lib/auth-jwt';

export async function getAuthUser(): Promise<AgriCoreJWTPayload | null> {
  const token = (await cookies()).get('agricore_token')?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AgriCoreJWTPayload> {
  const user = await getAuthUser();
  if (!user) {
    const err = Object.assign(new Error('Authentication required. Please log in.'), {
      statusCode: 401,
    });
    throw err;
  }
  return user;
}

export async function requireAdmin(): Promise<AgriCoreJWTPayload> {
  const user = await requireAuth();
  if (user.roleName !== 'Admin') {
    const err = Object.assign(new Error('Admin access required.'), { statusCode: 403 });
    throw err;
  }
  return user;
}

