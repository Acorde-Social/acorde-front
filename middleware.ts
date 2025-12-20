// middleware.ts (na raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = !!token;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 1. Redirecionamento da raiz (CRÍTICO)
  if (request.nextUrl.pathname === '/') {
    const destination = isAuthenticated ? '/home' : '/landing';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 2. Lista de rotas protegidas (requerem autenticação)
  const protectedRoutes = ['/home', '/projects', '/studio'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  // 3. Usuários logados não podem acessar landing
  if (request.nextUrl.pathname.startsWith('/landing') && isAuthenticated) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', // Raiz
    '/home/:path*', // Tudo em /home
    '/projects/:path*', // Tudo em /projects
    '/studio/:path*', // Tudo em /studio
    '/landing/:path*', // Landing e subpaths
  ],
};
