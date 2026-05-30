
import { ROUTES } from "@/lib/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const SESSION_COOKIE_NAME = 'mosaic_session';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith(ROUTES.AUTH);

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.AUTH, req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
  }

  return NextResponse.next();
}