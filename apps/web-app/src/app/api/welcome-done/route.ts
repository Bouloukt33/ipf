import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ ok: true });

    // Cookie valable 1h — empêche le re-redirect à la prochaine visite /dashboard
    // dans la même session. Auth0 gère la session long terme.
    response.cookies.set('welcome_handled', '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 heure
        path: '/',
    });

    return response;
}