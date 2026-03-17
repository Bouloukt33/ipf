import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { IAchievement, ILeaderboardEntry, IStatItem } from '@/lib/type';

export interface StreakDay {
    label: string;
    status: 'done' | 'today' | 'none';
}

export interface StreakResponse {
    currentStreak: number;
    weekDays: StreakDay[];
}

export const dashboardService = {
    /**
     * Récupère les statistiques globales de l'utilisateur
     * (quiz réalisés, taux de réussite, temps moyen, jours de série).
     */
    getStats: (token: string): Promise<IStatItem[]> =>
        apiFetch(API_ENDPOINTS.dashboard.stats, { token }),

    /**
     * Récupère les succès/achievements de l'utilisateur avec leur progression.
     */
    getAchievements: (token: string): Promise<IAchievement[]> =>
        apiFetch(API_ENDPOINTS.dashboard.achievements, { token }),

    /**
     * Récupère la streak courante et l'état des 7 derniers jours.
     */
    getStreak: (token: string): Promise<StreakResponse> =>
        apiFetch(API_ENDPOINTS.dashboard.streak, { token }),

    /**
     * Récupère le mini-leaderboard affiché sur le dashboard (top 3 + user).
     */
    getLeaderboardPreview: (token: string): Promise<ILeaderboardEntry[]> =>
        apiFetch(API_ENDPOINTS.leaderboard.global, { token }),
};
