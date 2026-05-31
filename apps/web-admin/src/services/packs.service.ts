import { apiRequest } from '../lib/api';
import type { IPack, IPackFormData } from '../lib/types';

export interface IPackFilters {
    categoryId?: string;
    isActive?: boolean;
    includeInactive?: boolean;
}

export const packsService = {
    getAll: (token: string, filters?: Partial<IPackFilters>): Promise<IPack[]> => {
        const params = new URLSearchParams();
        if (filters?.categoryId) params.set('categoryId', filters.categoryId);
        if (filters?.includeInactive) params.set('includeInactive', 'true');
        return apiRequest(`/packs?${params.toString()}`, token);
    },

    getById: (token: string, id: string): Promise<IPack> =>
        apiRequest(`/packs/${id}`, token),

    create: (token: string, data: IPackFormData): Promise<IPack> =>
        apiRequest<IPack>('/packs', token, {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(async (pack) => {
            // Si des questions sont spécifiées, on les ajoute
            if (data.questionIds && data.questionIds.length > 0) {
                await apiRequest(`/packs/${pack.id}/questions`, token, {
                    method: 'POST',
                    body: JSON.stringify({ questionIds: data.questionIds }),
                });
            }
            return pack;
        }),

    update: (token: string, id: string, data: Partial<IPackFormData>): Promise<IPack> =>
        apiRequest<IPack>(`/packs/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(async (pack) => {
            // Note: Simplification, on remplace toutes les questions
            // L'API backend devrait normalement gérer la synchronisation
            if (data.questionIds !== undefined) {
                await apiRequest(`/packs/${pack.id}/questions`, token, {
                    method: 'POST',
                    body: JSON.stringify({ questionIds: data.questionIds }),
                });
            }
            return pack;
        }),

    delete: (token: string, id: string): Promise<void> =>
        apiRequest(`/packs/${id}`, token, { method: 'DELETE' }),

    toggleActive: (token: string, id: string): Promise<IPack> =>
        apiRequest(`/packs/${id}/toggle-active`, token, { method: 'POST' }),
};
