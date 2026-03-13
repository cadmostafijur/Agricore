import { NextRequest, NextResponse } from 'next/server';
import { json } from '@/app/api/_utils/response';

function getLogoutCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    'agricore_token=',
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    `SameSite=${isProd ? 'Lax' : 'Lax'}`,
    isProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export async function GET(req: NextRequest) {
  const redirectTo = req.nextUrl.searchParams.get('redirect') || '/login';
  const target = new URL(redirectTo, req.url);
  const response = NextResponse.redirect(target);
  response.headers.set('Set-Cookie', getLogoutCookie());
  return response;
}

export async function POST() {
  return json(
    { success: true, message: 'Logged out successfully.' },
    { status: 200, headers: { 'Set-Cookie': getLogoutCookie() } }
  );
}

