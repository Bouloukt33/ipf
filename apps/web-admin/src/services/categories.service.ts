import { apiRequest } from '../lib/api';
import type { ICategory } from '../lib/types';

export interface ICategoryFormData {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    iconUrl?: string;
    order?: number;
    isPremium?: boolean;
    isActive?: boolean;
}

export const categoriesService = {
    getAll: (token: string): Promise<ICategory[]> =>
        apiRequest('/admin/categories', token),

    create: (token: string, data: ICategoryFormData): Promise<ICategory> =>
        apiRequest('/admin/categories', token, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (token: string, id: string, data: Partial<ICategoryFormData>): Promise<ICategory> =>
        apiRequest(`/admin/categories/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (token: string, id: string): Promise<void> =>
        apiRequest(`/admin/categories/${id}`, token, { method: 'DELETE' }),

    toggleActive: (token: string, id: string): Promise<ICategory> =>
        apiRequest(`/admin/categories/${id}/toggle-active`, token, { method: 'POST' }),

    getAdminMeta: (token: string): Promise<{ categories: ICategory[]; packs: any[]; videos: any[] }> =>
        Promise.allSettled([
            apiRequest<ICategory[]>('/admin/categories', token),
            apiRequest<any[]>('/packs', token),
        ]).then(([catRes, packsRes]) => ({
            categories: catRes.status === 'fulfilled' ? catRes.value : [],
            packs: packsRes.status === 'fulfilled' ? packsRes.value : [],
            videos: [],
        })),
};
