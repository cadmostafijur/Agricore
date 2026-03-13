import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface AgriCoreJWTPayload extends JWTPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: 'Admin' | 'Customer' | string;
}

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback_insecure_secret');

const getExpiresInSeconds = (): number => {
  // supports e.g. "7d", "24h", "3600"
  const raw = process.env.JWT_EXPIRES_IN ?? '7d';
  const m = raw.match(/^(\d+)([smhd])?$/i);
  if (!m) return 7 * 24 * 60 * 60;
  const value = Number(m[1]);
  const unit = (m[2] ?? 's').toLowerCase();
  const mult = unit === 'm' ? 60 : unit === 'h' ? 3600 : unit === 'd' ? 86400 : 1;
  return value * mult;
};

export async function signToken(payload: AgriCoreJWTPayload): Promise<string> {
  const expSeconds = getExpiresInSeconds();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expSeconds}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AgriCoreJWTPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as AgriCoreJWTPayload;
}

