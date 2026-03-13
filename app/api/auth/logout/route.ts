import { json } from '@/app/api/_utils/response';

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    'agricore_token=',
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    `SameSite=${isProd ? 'Lax' : 'Lax'}`,
    isProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  return json({ success: true, message: 'Logged out successfully.' }, { status: 200, headers: { 'Set-Cookie': cookie } });
}

