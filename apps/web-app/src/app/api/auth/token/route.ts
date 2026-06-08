import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json(null, { status: 401 });
    return NextResponse.json({ accessToken: session.tokenSet.accessToken });
}