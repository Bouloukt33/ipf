import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { usersService } from '../services/users.service';
import type { SubscriptionItem } from '../services/users.service';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminSubscriptions() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '', planSlug: '', page: 1, limit: 20 });
  const [meta, setMeta] = useState<any>(null);

  const loadSubscriptions = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const response = await usersService.getSubscriptions(token, filters);
      setSubscriptions(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently, filters]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return { subscriptions, meta, isLoading, error, setFilters, filters };
}
