
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


export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  const isAuthPage = req.nextUrl.pathname.startsWith(ROUTES.AUTH);

  const noRedirect = NO_FORCED_REDIRECT.some((route) => req.nextUrl.pathname === route);

  if (!noRedirect) {
    if (!token && !isAuthPage) {
      return NextResponse.redirect(new URL(ROUTES.AUTH, req.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};