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
        // Catalogue complet (packs privés de tous les users, inactifs inclus)
        // — exige la permission write:questions côté API.
        params.set('scope', 'admin');
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
        }),

    update: (token: string, id: string, data: Partial<IPackFormData>): Promise<IPack> =>
        apiRequest<IPack>(`/packs/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (token: string, id: string): Promise<void> =>
        apiRequest(`/packs/${id}`, token, { method: 'DELETE' }),

    toggleActive: (token: string, id: string): Promise<IPack> =>
        apiRequest(`/packs/${id}/toggle-active`, token, { method: 'POST' }),
};
