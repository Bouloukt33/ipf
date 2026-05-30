import { apiRequest } from '../lib/api';
import type { IPack } from '../lib/types';

export interface IPackFilters {
    categoryId?: string;
    type?: string;
    isActive?: boolean;
}

export interface IPackFormData {
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    type?: string;
    isFree?: boolean;
    price?: string;
    order?: number;
    isActive?: boolean;
}

export const packsService = {
    getAll: (token: string, filters?: Partial<IPackFilters>): Promise<IPack[]> => {
        const params = new URLSearchParams();
        if (filters?.categoryId) params.set('categoryId', filters.categoryId);
        return apiRequest(`/packs?${params.toString()}`, token);
    },

    getById: (token: string, id: string): Promise<IPack> =>
        apiRequest(`/packs/${id}`, token),

    create: (token: string, data: IPackFormData): Promise<IPack> =>
        apiRequest('/packs', token, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                price: data.price ? parseFloat(data.price) : undefined,
            }),
        }),

    update: (token: string, id: string, data: Partial<IPackFormData>): Promise<IPack> =>
        apiRequest(`/packs/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify({
                ...data,
                price: data.price !== undefined ? (data.price ? parseFloat(data.price) : null) : undefined,
            }),
        }),

    delete: (token: string, id: string): Promise<void> =>
        apiRequest(`/packs/${id}`, token, { method: 'DELETE' }),

    toggleActive: (token: string, id: string): Promise<IPack> =>
        apiRequest(`/packs/${id}/toggle-active`, token, { method: 'POST' }),
};
