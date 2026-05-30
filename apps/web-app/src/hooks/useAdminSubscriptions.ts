'use client';

import { ISubscriptionUser, ISubscriptionFilters } from '@/lib/subscription.types';
import { subscriptionsAdminService } from '@/services/subscriptions.admin.service';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_FILTERS: ISubscriptionFilters = { search: '', planSlug: '', status: '' };

export function useAdminSubscriptions() {
    const [users, setUsers]             = useState<ISubscriptionUser[]>([]);
    const [filters, setFiltersState]    = useState<ISubscriptionFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal]             = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    const load = useCallback(async (f: ISubscriptionFilters, page: number) => {
        setIsLoading(true); setError(null);
        try {
            const { data, meta } = await subscriptionsAdminService.getAll(f, page, 20);
            setUsers(data); setTotal(meta.total); setTotalPages(meta.totalPages);
        } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        load(filters, currentPage);
    }, [filters, currentPage, load, authLoading, accessToken]);

    const setFilters = useCallback((f: Partial<ISubscriptionFilters>) => {
        setFiltersState((p) => ({ ...p, ...f })); setCurrentPage(1);
    }, []);

    return {
        users, setUsers, filters, isLoading, error, currentPage, totalPages, total,
        setPage: (p: number) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); },
        setFilters,
        resetFilters: () => { setFiltersState(DEFAULT_FILTERS); setCurrentPage(1); },
    };
}
