'use client';

import { IUserAnalytics, IUserAnalyticsFilters } from '@/lib/user.analytics.types';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect, useCallback } from 'react';

const ITEMS_PER_PAGE = 20;

const DEFAULT_FILTERS: IUserAnalyticsFilters = {
    search:             '',
    professionalStatus: '',
    ageRange:           '',
};

interface UseUserAnalyticsReturn {
    users:       IUserAnalytics[];
    filters:     IUserAnalyticsFilters;
    isLoading:   boolean;
    error:       string | null;
    currentPage: number;
    totalPages:  number;
    total:       number;
    setPage:     (page: number) => void;
    setFilters:  (f: Partial<IUserAnalyticsFilters>) => void;
    resetFilters: () => void;
    refresh:     () => Promise<void>;
}

export function useUserAnalytics(): UseUserAnalyticsReturn {
    const [users, setUsers]             = useState<IUserAnalytics[]>([]);
    const [filters, setFiltersState]    = useState<IUserAnalyticsFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal]             = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    const load = useCallback(async (f: IUserAnalyticsFilters, page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, meta } = await analyticsService.getUsers(f, page, ITEMS_PER_PAGE);
            setUsers(data);
            setTotal(meta.total);
            setTotalPages(meta.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        load(filters, currentPage);
    }, [filters, currentPage, load, authLoading, accessToken]);

    const setFilters = useCallback((f: Partial<IUserAnalyticsFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...f }));
        setCurrentPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
        setCurrentPage(1);
    }, []);

    const setPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }, [totalPages]);

    const refresh = useCallback(async () => {
        await load(filters, currentPage);
    }, [filters, currentPage, load]);

    return { users, filters, isLoading, error, currentPage, totalPages, total, setPage, setFilters, resetFilters, refresh };
}
