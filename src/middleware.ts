import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  // If the route is related to next-auth or static assets, let it pass
  if (req.nextUrl.pathname.startsWith('/api/auth') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Handle auth: we don't want unauthorized users to see the dash
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development" });
  
  // Is the user on the login page or share page?
  const isLoginPage = req.nextUrl.pathname.endsWith('/login') || req.nextUrl.pathname.endsWith('/share');

  if (!token && !isLoginPage) {
    const loginUrl = new URL(`/${routing.defaultLocale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginPage) {
    const dashUrl = new URL(`/${routing.defaultLocale}`, req.url);
    return NextResponse.redirect(dashUrl);
  }

  // Run next-intl middleware for locale negotiation and redirect
  return intlMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|ur)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
