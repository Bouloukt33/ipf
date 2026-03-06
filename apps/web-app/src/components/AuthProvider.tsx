'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { syncUserWithBackend } from '@/lib/auth.api';

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

        syncUserWithBackend(accessToken)
            .then(setUser)
            .catch((err) => {
                console.error('[AuthProvider] sync error:', err);
                clearUser();
            });
    }, [accessToken]);

    return <>{children}</>;
}