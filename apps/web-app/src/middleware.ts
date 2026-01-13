import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

const publicRoutes = ['/', '/login', '/register'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Vérifier la session
    const session = await verifySession(request);
    const isAuthenticated = !!session;

    // Si l'utilisateur est connecté et essaie d'accéder à login/register
    if (isAuthenticated && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};