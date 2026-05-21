'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { syncUserWithBackend } from '@/services/auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setUser = useAuthStore((s) => s.setUser);
    const clearUser = useAuthStore((s) => s.clearUser);

    useEffect(() => {
        fetch('/api/auth/token')
            .then((res) => res.ok ? res.json() : null)
            .then(async (data) => {
                if (!data?.accessToken) return clearUser(); 
                const user = await syncUserWithBackend(data.accessToken);                
                if (user) setUser(user, data.accessToken); 
                else clearUser();
            })
            .catch(() => clearUser());
    }, []);

    return <>{children}</>;
}