import { ROUTES } from "@/lib/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = 'mosaic_session';

let NO_FORCED_REDIRECT = [
  ROUTES.LANDING,
  ROUTES.EXPLORE,
] as string[];

NO_FORCED_REDIRECT = [
  ...NO_FORCED_REDIRECT.map(r => r.slice(0, -1)),
  ...NO_FORCED_REDIRECT
];

const NO_FORCED_REDIRECT_PREFIXES = [
  '/invite/',
  '/post/',
  '/u/',
  '/v/',
  '/docs/'
];

// API paths that do not require session cookie authentication
const PUBLIC_API_PREFIXES = [
  '/api/health',
  '/api/auth',
  '/api/docs',
  '/api/dev',
  '/api/explore',
  '/api/preview',
  '/api/villages',
  '/api/pieces',
  '/api/invites',
];

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export function middleware(req: NextRequest) {
  // Canonical site URL redirect in production
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === 'production' && siteUrl) {
    try {
      const target = new URL(siteUrl);
      const currentHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;

      if (currentHost && currentHost !== target.host) {
        const redirectUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, target.origin);
        return addSecurityHeaders(NextResponse.redirect(redirectUrl, 301));
      }
    } catch {
      // Ignore invalid NEXT_PUBLIC_SITE_URL
    }
  }

  const isLoggingOut = req.cookies.has('mosaic_logging_out');
  const token = isLoggingOut ? undefined : req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const pathname = req.nextUrl.pathname;

  // Handle API route security & authentication check
  if (pathname.startsWith('/api')) {
    const isPublicApi = PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix));
    
    if (!token && !isPublicApi) {
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  const isAuthPage = pathname.startsWith(ROUTES.AUTH);
  const noRedirectExact = NO_FORCED_REDIRECT.some((route) => pathname === route);
  const noRedirectPrefix = NO_FORCED_REDIRECT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const noRedirect = noRedirectExact || noRedirectPrefix;

  if (!noRedirect) {
    if (!token && !isAuthPage) {
      const loginUrl = new URL(ROUTES.AUTH, req.url);
      loginUrl.searchParams.set('next', pathname + req.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      return addSecurityHeaders(response);
    }

    if (token && isAuthPage) {
      const response = NextResponse.redirect(new URL(ROUTES.HOME, req.url));
      return addSecurityHeaders(response);
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};