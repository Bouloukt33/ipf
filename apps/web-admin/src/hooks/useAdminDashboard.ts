import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { adminService } from '../services/admin.service';
import type { DashboardStats } from '../services/admin.service';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminDashboard() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const [statsData, activityData] = await Promise.all([
        adminService.getStats(token),
        adminService.getActivity(token),
      ]);
      setStats(statsData);
      setActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    stats,
    activity,
    isLoading,
    error,
    refresh: loadData,
  };
}
