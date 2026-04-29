import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function PostLoginPage() {
    const session = await auth0.getSession();

    if (!session?.tokenSet.accessToken) redirect('/auth/login');

    let isNewUser = false;
    let role = 'USER';

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.tokenSet.accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            isNewUser = data.isNewUser ?? false;
            role = data.user?.role ?? 'USER';
        }
    } catch {
        // sync échoué → on atterrit quand même sur /dashboard
    }

    if (isNewUser) redirect('/welcome?type=register');
    if (role === 'ADMIN' || role === 'MODERATOR') redirect('/dashboard/admin');
    redirect('/dashboard');
}