
import { ROUTES } from "@/lib/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const SESSION_COOKIE_NAME = 'mosaic_session';

let NO_FORCED_REDIRECT = [
  ROUTES.LANDING,
  ROUTES.HOME,
] as string[];

NO_FORCED_REDIRECT = [
  ...NO_FORCED_REDIRECT.map(r => r.slice(0, -1)),
  ...NO_FORCED_REDIRECT
]

const NO_FORCED_REDIRECT_PREFIXES = [
  '/invite/',
  '/post/',
  '/u/',
  '/v/',
];


export function middleware(req: NextRequest) {
  const isLoggingOut = req.cookies.has('mosaic_logging_out');
  const token = isLoggingOut ? undefined : req.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  const pathname = req.nextUrl.pathname;
  const isAuthPage = pathname.startsWith(ROUTES.AUTH);

  const noRedirectExact = NO_FORCED_REDIRECT.some((route) => pathname === route);
  const noRedirectPrefix = NO_FORCED_REDIRECT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const noRedirect = noRedirectExact || noRedirectPrefix;

  if (!noRedirect) {
    if (!token && !isAuthPage) {
      const loginUrl = new URL(ROUTES.AUTH, req.url);
      loginUrl.searchParams.set('next', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};