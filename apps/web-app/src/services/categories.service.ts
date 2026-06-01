import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { ICategory } from '@/lib/question.types';

export const categoriesService = {
    /**
     * Récupère les catégories de questions disponibles
     */
    getCategories: (): Promise<ICategory[]> =>
        apiFetch(API_ENDPOINTS.categories.list, {}),
};