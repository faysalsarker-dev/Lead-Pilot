import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const CRON_SECRET = process.env.CRON_SECRET;
const PROTECTED_ROUTES = ['/(pages)', '/api'];
const PUBLIC_ROUTES = ['/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is a cron route
  const isCronRoute = pathname.startsWith('/api/cron/');
  if (isCronRoute) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid CRON_SECRET' },
        { status: 401 }
      );
    }
    // Cron route verified, allow through
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiresAuth = PROTECTED_ROUTES.some((route) => pathname.match(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.match(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (requiresAuth) {
    // Get JWT token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Redirect unauthenticated users to login for page routes
      if (pathname.startsWith('/(pages)')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Session required' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
