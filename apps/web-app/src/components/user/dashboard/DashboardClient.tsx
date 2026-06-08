'use client';
import { useRole } from '@/store/auth.store';

export function DashboardClient({ user }: { user: any }) {
    const role = useRole();

    return (
        <div>
            <p>Rôle : {role}</p>
        </div>
    );
}