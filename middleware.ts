import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

// Encode JWT_SECRET for jose (Edge-compatible)
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
};

interface AgriCoreJWT extends JWTPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
}

const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const PROTECTED_PREFIX = ['/dashboard', '/profile', '/admin', '/reports'];
const ADMIN_PREFIX = ['/admin'];
const CUSTOMER_PREFIX = ['/dashboard', '/profile', '/reports'];

function matchesRoute(pathname: string, route: string): boolean {
  if (route === '/') return pathname === '/';
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('agricore_token')?.value;

  const isPublic = PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route));
  const isProtected = PROTECTED_PREFIX.some((route) => matchesRoute(pathname, route));

  // ── Unauthenticated user hitting a protected route ────────
  if (isProtected) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(token, getSecret());
      const decoded = payload as AgriCoreJWT;

      // RBAC: Admin-only routes
      const isAdminRoute = ADMIN_PREFIX.some((route) => matchesRoute(pathname, route));
      if (isAdminRoute && decoded.roleName !== 'Admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      // RBAC: Customer-only routes
      const isCustomerRoute = CUSTOMER_PREFIX.some((route) => matchesRoute(pathname, route));
      if (isCustomerRoute && decoded.roleName !== 'Customer') {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch {
      // Token invalid/expired → send to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Already authenticated user hitting /login or /signup ──
  if (isPublic && (pathname === '/login' || pathname === '/signup') && token) {
    try {
      await jwtVerify(token, getSecret());
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Invalid token — let them through to the auth page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes    (handled by server-side auth checks)
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (png, jpg, svg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
};
