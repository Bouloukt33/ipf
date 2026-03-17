import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';

export interface ThemeProgression {
    name: string;
    count: string;
    pct: number;
    stars: number;
    icBg: string;
    barStyle: string;
}

export const themesService = {
    /**
     * Récupère tous les thèmes avec leur progression utilisateur.
     */
    getAll: (token: string): Promise<ThemeProgression[]> =>
        apiFetch(API_ENDPOINTS.themes.list, { token }),

    /**
     * Récupère un thème spécifique par son slug (ex: "bail-commercial").
     */
    getBySlug: (slug: string, token: string): Promise<ThemeProgression> =>
        apiFetch(API_ENDPOINTS.themes.bySlug(slug), { token }),
};
