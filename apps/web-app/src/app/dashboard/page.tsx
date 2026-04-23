import { DashboardClient } from '@/components/user/dashboard/DashboardClient';
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV === 'development';

async function syncUser(accessToken: string) {
    try {
        await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
    } catch (error) {
        // Server-side only log — safe in production
        if (isDev) console.error('[Dashboard] Sync user error:', error);
    }
}

export default async function DashboardPage() {
    const session = await auth0.getSession();    
    if (!session) redirect('/auth/login');

    return <DashboardClient user={session.user} />;
}