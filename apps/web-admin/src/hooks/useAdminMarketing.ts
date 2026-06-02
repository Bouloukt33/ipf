import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiRequest } from '../lib/api';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export interface IPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  intervalMonths: number;
  features: string[] | null;
  isActive: boolean;
  order: number;
  _count: { subscriptions: number };
}

export interface IPlanFormData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  intervalMonths: number;
  features: string[];
  isActive: boolean;
  order: number;
}

export function useAdminPlans() {
  const { getAccessTokenSilently } = useAuth0();
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = useCallback(async () => {
    return getAccessTokenSilently({
      authorizationParams: {
        audience: ENV.auth0Audience,
        scope: AUTH0_SCOPE,
      },
    });
  }, [getAccessTokenSilently]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const data = await apiRequest<IPlan[]>('/admin/plans', token);
      setPlans(data);
    } catch (err) {
      console.error('[useAdminPlans] Failed to load plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPlan = useCallback(async (data: IPlanFormData) => {
    const token = await getToken();
    await apiRequest('/admin/plans', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await refresh();
  }, [getToken, refresh]);

  const updatePlan = useCallback(async (id: string, data: Partial<IPlanFormData>) => {
    const token = await getToken();
    await apiRequest(`/admin/plans/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await refresh();
  }, [getToken, refresh]);

  const deletePlan = useCallback(async (id: string) => {
    const token = await getToken();
    await apiRequest(`/admin/plans/${id}`, token, {
      method: 'DELETE',
    });
    await refresh();
  }, [getToken, refresh]);

  return { plans, isLoading, refresh, createPlan, updatePlan, deletePlan };
}
