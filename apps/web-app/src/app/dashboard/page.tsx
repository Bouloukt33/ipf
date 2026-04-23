import { DashboardClient } from '@/components/user/dashboard/DashboardClient';
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV === 'development';

// Retourne le type renvoyé par ton API : "login" | "register"
async function syncUser(accessToken: string): Promise<"login" | "register" | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        //const data = await res.json();
        // Ton API retourne { type: "login" | "register", ... }
        //return data?.type ?? null;
        return "login"; // statique -> à changer par la suite
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