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

/** Session récente telle que consommée par le dashboard (endpoint /admin/activity). */
export interface RecentSession {
  id: string;
  score: number;
  xpEarned: number;
  completedAt: string;
  pack?: { name: string } | null;
  user: {
    profile?: { displayName?: string | null; avatarUrl?: string | null } | null;
  };
}

export const adminService = {
  getStats: (token: string): Promise<DashboardStats> =>
    apiRequest('/admin/dashboard', token),

  getActivity: (token: string): Promise<{ recentSessions: RecentSession[]; recentUsers: any[] }> =>
    apiRequest('/admin/activity', token),
};
