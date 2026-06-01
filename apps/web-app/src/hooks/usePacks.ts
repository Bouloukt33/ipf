'use client';

import { IPack, IPackFilters, IPackFormData, IPackStats } from '@/lib/pack.types';
import { ICategory } from '@/lib/question.types';
import { categoriesService } from '@/services/categories.service';
import { packsService } from '@/services/packs.service';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect, useCallback } from 'react';

interface UsePacksReturn {
    packs: IPack[];
    stats: IPackStats | null;
    filters: IPackFilters;
    isLoading: boolean;
    error: string | null;
    categories: ICategory[];
    setFilters: (filters: Partial<IPackFilters>) => void;
    resetFilters: () => void;
    createPack: (data: IPackFormData) => Promise<IPack>;
    updatePack: (id: string, data: Partial<IPackFormData>) => Promise<IPack>;
    deletePack: (id: string) => Promise<void>;
    toggleActive: (id: string) => Promise<IPack>;
    refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: IPackFilters = {
    search: '',
    categoryId: '',
    type: '',
};

function computeStats(packs: IPack[]): IPackStats {
    return {
        total:   packs.length,
        active:  packs.filter((p) => p.isActive).length,
        free:    packs.filter((p) => p.isFree).length,
        visiteur: packs.filter((p) => p.type === 'VISITEUR').length,
        premium: packs.filter((p) => p.type === 'PREMIUM').length,
    };
}

export function usePacks(): UsePacksReturn {
    const [allPacks, setAllPacks]     = useState<IPack[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [stats, setStats]           = useState<IPackStats | null>(null);
    const [filters, setFiltersState]  = useState<IPackFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading]   = useState(false);
    const [error, setError]           = useState<string | null>(null);

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [data, cats] = await Promise.all([
                packsService.getAll(),
                categoriesService.getCategories(),
            ]);
            setAllPacks(data);
            setStats(computeStats(data));
            setCategories(cats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        loadAll();
    }, [loadAll, authLoading, accessToken]);

    const packs = allPacks.filter((p) => {
        if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
        if (filters.type && p.type !== filters.type) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const setFilters = useCallback((newFilters: Partial<IPackFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

    const refresh = useCallback(async () => { await loadAll(); }, [loadAll]);

    const createPack = useCallback(async (data: IPackFormData): Promise<IPack> => {
        const created = await packsService.create(data);
        await refresh();
        return created;
    }, [refresh]);

    const updatePack = useCallback(async (id: string, data: Partial<IPackFormData>): Promise<IPack> => {
        const updated = await packsService.update(id, data);
        await refresh();
        return updated;
    }, [refresh]);

    const deletePack = useCallback(async (id: string): Promise<void> => {
        await packsService.delete(id);
        await refresh();
    }, [refresh]);

    const toggleActive = useCallback(async (id: string): Promise<IPack> => {
        const updated = await packsService.toggleActive(id);
        await refresh();
        return updated;
    }, [refresh]);

    return {
        packs,
        stats,
        filters,
        isLoading,
        error,
        categories,
        setFilters,
        resetFilters,
        createPack,
        updatePack,
        deletePack,
        toggleActive,
        refresh,
    };
}
