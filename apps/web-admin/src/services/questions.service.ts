import { apiRequest } from '../lib/api';
import type { IQuestion, IQuestionFilters, IQuestionFormData, IQuestionStats } from '../lib/types';

export interface IPaginatedQuestions {
    data: IQuestion[];
    total: number;
    totalPages: number;
}

export const questionsService = {
    getAll: (
        token: string,
        filters?: Partial<IQuestionFilters>,
        page = 1,
        limit = 10,
    ): Promise<IPaginatedQuestions> => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        if (filters?.search) params.set('search', filters.search);
        if (filters?.categoryId) params.set('categoryId', filters.categoryId);
        if (filters?.themeId) params.set('themeId', filters.themeId);
        if (filters?.level) params.set('level', filters.level.toString());
        if (filters?.status) params.set('status', filters.status);

        return apiRequest<any>(`/questions?${params.toString()}`, token).then((res) => ({
            data: res.data || [],
            total: res.meta?.total || 0,
            totalPages: res.meta?.totalPages || 1,
        }));
    },

    getById: (token: string, id: string): Promise<IQuestion> =>
        apiRequest(`/questions/${id}`, token),

    create: (token: string, data: IQuestionFormData): Promise<IQuestion> =>
        apiRequest('/questions', token, { method: 'POST', body: JSON.stringify(data) }),

    update: (token: string, id: string, data: Partial<IQuestionFormData>): Promise<IQuestion> =>
        apiRequest(`/questions/${id}`, token, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (token: string, id: string): Promise<void> =>
        apiRequest(`/questions/${id}`, token, { method: 'DELETE' }),

    updateStatus: (token: string, id: string, status: string): Promise<IQuestion> =>
        apiRequest(`/questions/${id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) }),

    getStats: (token: string): Promise<IQuestionStats> =>
        apiRequest<any>('/admin/questions/stats', token).then(stats => ({
            total: stats.total || 0,
            active: stats.active || 0,
            suspended: stats.suspended || 0,
            archived: stats.archived || 0,
            premium: stats.premiumCount || 0
        })).catch(() => ({
            total: 0,
            active: 0,
            suspended: 0,
            archived: 0,
            premium: 0
        })),
};
