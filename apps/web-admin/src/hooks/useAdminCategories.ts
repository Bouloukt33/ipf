import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { categoriesService } from '../services/categories.service';
import type { ICategory } from '../lib/types';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminCategories() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const data = await categoriesService.getAdminMeta(token);
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur baux');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, isLoading, error, refresh: loadCategories };
}
