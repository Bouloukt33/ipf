import { apiRequest } from '../lib/api';

export interface UserAnalytics {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    level: number;
    streakDays: number;
  };
  stats: {
    sessionsPlayed: number;
    accuracy: number;
    totalXpEarned: number;
  };
}

export interface SubscriptionItem {
  id: string;
  email: string;
  isActive: boolean;
  profile: {
    displayName: string | null;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    plan: {
      name: string;
      price: number;
    };
  };
  usage: {
    sessionsPlayed: number;
    totalHours: number;
  };
}

export const usersService = {
  getAnalytics: (token: string, params: any): Promise<{ data: UserAnalytics[], meta: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${query}`, token);
  },

  getSubscriptions: (token: string, params: any): Promise<{ data: SubscriptionItem[], meta: any }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/subscriptions?${query}`, token);
  },

  getProspects: (token: string): Promise<{ upsell: any[], coaching: any[] }> =>
    apiRequest('/admin/subscriptions/prospects', token),
};
