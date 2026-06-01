import { apiRequest } from '../lib/api';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
  };
  questions: {
    total: number;
  };
  sessions: {
    total: number;
    last7Days: number;
  };
  categories: number;
  charts: {
    sessionsByDay: Array<{ date: string; sessions: number }>;
    usersByProStatus: Array<{ status: string; label: string; count: number }>;
    questionsByCategory: Array<{ category: string; color: string; count: number }>;
  };
}

export interface ActivityItem {
  id: string;
  type: 'session' | 'user';
  date: string;
  title: string;
  subtitle: string;
  user: {
    displayName: string;
    avatarUrl: string | null;
  };
}

export const adminService = {
  getStats: (token: string): Promise<DashboardStats> =>
    apiRequest('/admin/dashboard', token),

  getActivity: (token: string): Promise<{ recentSessions: any[]; recentUsers: any[] }> =>
    apiRequest('/admin/activity', token),
};
