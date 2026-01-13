import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Session {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Créer un token JWT
export async function createToken(payload: any, expiresIn: string = '1h') {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(expiresIn)
        .setIssuedAt()
        .sign(SECRET_KEY);
}

// Vérifier un token JWT
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}

// Récupérer la session depuis les cookies
export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken) return null;

    const payload = await verifyToken(accessToken);
    if (!payload) return null;

    return {
        user: payload.user as User,
        accessToken,
        refreshToken: refreshToken || '',
    };
}

// Sauvegarder la session dans les cookies
export async function setSession(session: Session) {
    const cookieStore = await cookies();

    cookieStore.set('accessToken', session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 heure
        path: '/',
    });

    cookieStore.set('refreshToken', session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
    });
}

// Supprimer la session
export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
}

// Vérifier la session depuis une requête (pour middleware)
export async function verifySession(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) return null;

    const payload = await verifyToken(accessToken);
    return payload;
}