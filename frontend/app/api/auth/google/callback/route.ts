import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth-jwt';

async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL!;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) throw new Error('google_token_exchange_failed');
  return (await res.json()) as { access_token: string; id_token?: string };
}

async function fetchUserInfo(accessToken: string) {
  const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('google_userinfo_failed');
  return (await res.json()) as { sub: string; email?: string; name?: string; picture?: string };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '/dashboard';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl || !code) {
    return Response.redirect(new URL(`/login?error=google_auth_failed`, url.origin));
  }

  try {
    const { access_token } = await exchangeCodeForTokens(code);
    const profile = await fetchUserInfo(access_token);

    const email = profile.email;
    if (!email) return Response.redirect(new URL(`/login?error=google_auth_failed`, url.origin));

    const googleId = profile.sub;
    const avatar = profile.picture ?? null;
    const name = profile.name ?? 'Google User';

    let user = await prisma.user.findFirst({
      where: { OR: [{ google_id: googleId }, { email }] },
      include: { role: true },
    });

    if (!user) {
      const customerRole = await prisma.role.findUnique({ where: { role_name: 'Customer' } });
      if (!customerRole) {
        return Response.redirect(new URL(`/login?error=google_auth_failed`, url.origin));
      }

      user = await prisma.user.create({
        data: {
          name,
          email,
          google_id: googleId,
          avatar,
          role_id: customerRole.id,
        },
        include: { role: true },
      });
    } else if (!user.google_id) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { google_id: googleId, avatar: avatar ?? user.avatar },
        include: { role: true },
      });
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

    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': cookie,
        Location: state.startsWith('/') ? state : '/dashboard',
      },
    });
  } catch {
    return Response.redirect(new URL(`/login?error=google_auth_failed`, url.origin));
  }
}

