import { type NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'ln_auth';
const LOGIN_PATH = '/login';
const LANDING_PATH = '/';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isLoginPath = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
  const isLandingPath = pathname === LANDING_PATH;

  if (!isLoginPath && !isLandingPath) {
    const authCookie = request.cookies.get(AUTH_COOKIE);
    if (!authCookie?.value) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
