import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV === 'development';

export async function GET() {
    try {
        const session = await auth0.getSession();

        if (!session || !session.tokenSet.accessToken) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.tokenSet.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const text = await response.text();
            if (isDev) console.error('[sync-user] API error:', response.status, text);
            return NextResponse.json({ error: 'Sync failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        if (isDev) console.error('[sync-user] Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
