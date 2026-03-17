import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { IThemeItem } from '@/lib/type';

export interface IProgressionEntry {
    id: string;
    month: string;
    themes: IThemeItem[];
}

export const progressionService = {
    /**
     * Récupère toutes les progressions de l'utilisateur.
     */
    getAll: (token: string): Promise<IProgressionEntry[]> =>
        apiFetch(API_ENDPOINTS.progression.list, { token }),

    /**
     * Récupère la progression pour un mois donné (format: "2024-03").
     */
    getByMonth: (month: string, token: string): Promise<IProgressionEntry> =>
        apiFetch(API_ENDPOINTS.progression.byMonth(month), { token }),

    /**
     * Met à jour une progression existante.
     */
    update: (id: string, body: Partial<IProgressionEntry>, token: string): Promise<IProgressionEntry> =>
        apiFetch(API_ENDPOINTS.progression.update(id), {
            method: 'PATCH',
            body: JSON.stringify(body),
            token,
        }),
};
