import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { syncUserWithBackend } from '@/services/auth.service';

export default async function CallbackPage() {
    const session = await auth0.getSession();

    if (!session) redirect('/auth/login');

    const user = await syncUserWithBackend(session.tokenSet.accessToken!);

    switch (user?.role) {
        case 'ADMIN':
        case 'MODERATOR':
            redirect('/dashboard/admin');
        case 'USER':
        default:
            redirect('/dashboard');
    }
}