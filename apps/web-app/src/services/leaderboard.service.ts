import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { ILeaderboardRow, IPodiumEntry } from '@/lib/type';

export interface LeaderboardGlobalResponse {
    podium: IPodiumEntry[];
    rows: ILeaderboardRow[];
}

export const leaderboardService = {
    /**
     * Récupère le classement global : podium (top 3) + rows (rang 4+).
     */
    getGlobal: (token: string): Promise<LeaderboardGlobalResponse> =>
        apiFetch(API_ENDPOINTS.leaderboard.global),

    /**
     * Récupère uniquement le podium (top 3).
     */
    getPodium: (token: string): Promise<IPodiumEntry[]> =>
        apiFetch(API_ENDPOINTS.leaderboard.podium),

    /**
     * Récupère le classement filtré par thème.
     */
    getByTheme: (theme: string, token: string): Promise<LeaderboardGlobalResponse> =>
        apiFetch(API_ENDPOINTS.leaderboard.byTheme(theme)),
};
