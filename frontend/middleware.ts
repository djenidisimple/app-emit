import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('app-emit-token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    '/dashboard', '/planning', '/salles', '/edt-globale',
    '/reservations', '/admin', '/echanges'
  ];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/planning/:path*', '/salles/:path*',
    '/edt-globale/:path*', '/reservations/:path*',
    '/admin/:path*', '/echanges/:path*',
    '/login', '/register'
  ],
};
