import { apiRequest } from '../lib/api';
import type { ICategory } from '../lib/types';

export const categoriesService = {
    getCategories: (token: string): Promise<ICategory[]> =>
        apiRequest('/categories', token),
        
    getAdminMeta: (token: string): Promise<{ categories: ICategory[], packs: any[], videos: any[] }> =>
        apiRequest('/admin/questions/meta', token),
};
