'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { syncUserWithBackend } from '@/services/auth.service';

interface Props {
    accessToken: string | null;
}

export function AuthProvider({ accessToken, children }: React.PropsWithChildren<Props>) {
    const setUser = useAuthStore((s) => s.setUser);
    const clearUser = useAuthStore((s) => s.clearUser);

    useEffect(() => {
        if (!accessToken) {
            clearUser();
            return;
        }

        syncUserWithBackend().then(user => {
            if (user) setUser(user);
            else clearUser();
        });
    }, [accessToken]);

    return <>{children}</>;
}