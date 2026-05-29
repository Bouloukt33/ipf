'use client';

import { IUserAnalyticsDetail } from '@/lib/user.analytics.types';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect, useCallback } from 'react';

interface UseUserAnalyticsDetailReturn {
    user:      IUserAnalyticsDetail | null;
    isLoading: boolean;
    error:     string | null;
    refresh:   () => Promise<void>;
}

export function useUserAnalyticsDetail(id: string): UseUserAnalyticsDetailReturn {
    const [user, setUser]           = useState<IUserAnalyticsDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getUserDetail(id);
            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Utilisateur introuvable');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        load();
    }, [load, authLoading, accessToken]);

    const refresh = useCallback(async () => { await load(); }, [load]);

    return { user, isLoading, error, refresh };
}
