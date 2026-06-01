import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiRequest } from '../lib/api';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function useAdminPlans() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const data = await apiRequest<any[]>('/admin/plans', token);
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return { plans, isLoading, refresh: loadPlans };
}

export function useAdminEmails() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const data = await apiRequest<any[]>('/admin/email/templates', token);
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return { templates, isLoading };
}
