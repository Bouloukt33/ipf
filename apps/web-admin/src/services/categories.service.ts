import { apiRequest } from '../lib/api';
import type { ICategory } from '../lib/types';

export const categoriesService = {
    getCategories: (token: string): Promise<ICategory[]> =>
        apiRequest('/categories', token),
        
    getAdminMeta: (token: string): Promise<{ categories: ICategory[], packs: any[], videos: any[] }> =>
        Promise.allSettled([
            apiRequest<ICategory[]>('/admin/categories', token),
            apiRequest<any[]>('/packs', token),
        ]).then(([catRes, packsRes]) => ({
            categories: catRes.status === 'fulfilled' ? catRes.value : [],
            packs: packsRes.status === 'fulfilled' ? packsRes.value : [],
            videos: []
        })),
};
