import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { auth0 } from '@/lib/auth0';
import { IAchievement, ILeaderboardEntry, IStatItem } from '@/lib/type';
import { useAuthStore } from '@/store/auth.store';

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
    getStats: (): Promise<IStatItem[]> =>
        apiFetch(API_ENDPOINTS.dashboard.stats, {}),

    
    getThemes: (): Promise<{ name: string; count: string; pct: number; stars: number }[]> =>
        apiFetch(API_ENDPOINTS.progression.themes, {}),
    /**
     * Récupère les succès/achievements de l'utilisateur avec leur progression.
     */
    getAchievements: (): Promise<IAchievement[]> =>
        apiFetch(API_ENDPOINTS.dashboard.achievements, {}),

    /**
     * Récupère la streak courante et l'état des 7 derniers jours.
     */
    getStreak: (): Promise<StreakResponse> =>
        apiFetch(API_ENDPOINTS.dashboard.streak, {}),

    /**
     * Récupère le mini-leaderboard affiché sur le dashboard (top 3 + user).
     */
    getLeaderboardPreview: (): Promise<ILeaderboardEntry[]> =>
        apiFetch<{ podium: ILeaderboardEntry[]; rows: ILeaderboardEntry[] }>(
            API_ENDPOINTS.leaderboard.preview, {}
        ).then((raw) => [...raw.podium, ...raw.rows]),
};
