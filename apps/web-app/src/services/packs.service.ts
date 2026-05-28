import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { IPack, IPackFilters, IPackFormData } from '@/lib/pack.types';

export const packsService = {
    getAll: (filters?: Partial<IPackFilters>): Promise<IPack[]> => {
        const params = new URLSearchParams();
        params.set('includeInactive', 'true');
        if (filters?.categoryId) params.set('categoryId', filters.categoryId);
        if (filters?.type)       params.set('type', filters.type);
        return apiFetch(`${API_ENDPOINTS.packs.list}?${params.toString()}`);
    },

    getById: (id: string): Promise<IPack> =>
        apiFetch(API_ENDPOINTS.packs.byId(id)),

    create: (data: IPackFormData): Promise<IPack> =>
        apiFetch(API_ENDPOINTS.packs.create, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                price: data.price ? parseFloat(data.price) : undefined,
            }),
        }),

    update: (id: string, data: Partial<IPackFormData>): Promise<IPack> =>
        apiFetch(API_ENDPOINTS.packs.update(id), {
            method: 'PUT',
            body: JSON.stringify({
                ...data,
                price: data.price !== undefined ? (data.price ? parseFloat(data.price) : null) : undefined,
            }),
        }),

    delete: (id: string): Promise<void> =>
        apiFetch(API_ENDPOINTS.packs.delete(id), { method: 'DELETE' }),

    toggleActive: (id: string): Promise<IPack> =>
        apiFetch(API_ENDPOINTS.packs.toggleActive(id), { method: 'POST' }),

    addQuestions: (id: string, questionIds: string[]): Promise<IPack> =>
        apiFetch(API_ENDPOINTS.packs.addQuestions(id), {
            method: 'POST',
            body: JSON.stringify({ questionIds }),
        }),

    removeQuestion: (id: string, questionId: string): Promise<{ success: boolean }> =>
        apiFetch(API_ENDPOINTS.packs.removeQuestion(id, questionId), { method: 'DELETE' }),
};
