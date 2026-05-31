import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { packsService } from '../services/packs.service';
import { categoriesService } from '../services/categories.service';
import type { IPack, IPackFormData, ICategory } from '../lib/types';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminPacks() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [packs, setPacks] = useState<IPack[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const [packsData, meta] = await Promise.all([
        packsService.getAll(token, { includeInactive: true }),
        categoriesService.getAdminMeta(token)
      ]);
      setPacks(packsData);
      setCategories(meta.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement packs');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createPack = async (data: IPackFormData) => {
    const token = await getAccessTokenSilently({
        authorizationParams: { audience: ENV.auth0Audience, scope: AUTH0_SCOPE }
    });
    await packsService.create(token, data);
    await loadData();
  };

  const updatePack = async (id: string, data: IPackFormData) => {
    const token = await getAccessTokenSilently({
        authorizationParams: { audience: ENV.auth0Audience, scope: AUTH0_SCOPE }
    });
    await packsService.update(token, id, data);
    await loadData();
  };

  const deletePack = async (id: string) => {
    const token = await getAccessTokenSilently({
        authorizationParams: { audience: ENV.auth0Audience, scope: AUTH0_SCOPE }
    });
    await packsService.delete(token, id);
    await loadData();
  };

  return { packs, categories, isLoading, error, createPack, updatePack, deletePack, refresh: loadData };
}
