import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { categoriesService, type ICategoryFormData } from '../services/categories.service';
import type { ICategory } from '../lib/types';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminCategories() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getToken = useCallback(() =>
        getAccessTokenSilently({
            authorizationParams: { audience: ENV.auth0Audience, scope: AUTH0_SCOPE },
        }), [getAccessTokenSilently]);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const token = await getToken();
            const data = await categoriesService.getAll(token);
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur baux');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, getToken]);

    useEffect(() => { refresh(); }, [refresh]);

    const createCategory = useCallback(async (data: ICategoryFormData) => {
        const token = await getToken();
        await categoriesService.create(token, data);
        await refresh();
    }, [getToken, refresh]);

    const updateCategory = useCallback(async (id: string, data: Partial<ICategoryFormData>) => {
        const token = await getToken();
        await categoriesService.update(token, id, data);
        await refresh();
    }, [getToken, refresh]);

    const deleteCategory = useCallback(async (id: string) => {
        const token = await getToken();
        await categoriesService.delete(token, id);
        await refresh();
    }, [getToken, refresh]);

    const toggleActive = useCallback(async (id: string) => {
        const token = await getToken();
        await categoriesService.toggleActive(token, id);
        await refresh();
    }, [getToken, refresh]);

    return { categories, isLoading, error, refresh, createCategory, updateCategory, deleteCategory, toggleActive };
}
