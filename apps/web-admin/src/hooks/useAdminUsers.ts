import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { usersService } from '../services/users.service';
import type { UserAnalytics } from '../services/users.service';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminUsers() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [users, setUsers] = useState<UserAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 20 });
  const [meta, setMeta] = useState<any>(null);

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const response = await usersService.getAnalytics(token, filters);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur users');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, meta, isLoading, error, setFilters, filters };
}
