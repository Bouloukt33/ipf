import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { packsService } from '../services/packs.service';
import type { IPack } from '../lib/types';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminPacks() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [packs, setPacks] = useState<IPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPacks = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const data = await packsService.getAll(token);
      setPacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur packs');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  return { packs, isLoading, error, refresh: loadPacks };
}
