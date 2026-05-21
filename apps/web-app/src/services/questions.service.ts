import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { IQuestion, IQuestionFilters, IQuestionFormData, IQuestionStats } from '@/lib/question.types';

export interface IPaginatedQuestions {
    data: IQuestion[];
    total: number;
    totalPages: number;
}

interface IRawMeta {
    total?: number;
    totalPages?: number;
    count?: number;
    totalCount?: number;
}

interface IRawPaginatedResponse {
    data?: IQuestion[];
    items?: IQuestion[];
    questions?: IQuestion[];
    meta?: IRawMeta;
    total?: number;
    count?: number;
    totalCount?: number;
    totalPages?: number;
}

function extractPaginated(raw: unknown): IPaginatedQuestions {
    if (Array.isArray(raw)) {
        return { data: raw, total: raw.length, totalPages: 1 };
    }
    if (raw && typeof raw === 'object') {
        const r = raw as IRawPaginatedResponse;
        const data = r.data ?? r.items ?? r.questions ?? [];
        // Support { data, meta: { total, totalPages } } shape (backend actuel)
        const total      = r.meta?.total      ?? r.meta?.count ?? r.total ?? r.count ?? r.totalCount ?? data.length;
        const totalPages = r.meta?.totalPages  ?? r.totalPages  ?? 1;
        return { data, total, totalPages };
    }
    return { data: [], total: 0, totalPages: 1 };
}

export const questionsService = {
    getAll: (
        filters?: Partial<IQuestionFilters>,
        page = 1,
        limit = 10,
    ): Promise<IPaginatedQuestions> => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (filters?.search)     params.set('search', filters.search);
        if (filters?.leaseType)  params.set('leaseType', filters.leaseType);
        if (filters?.categoryId) params.set('categoryId', filters.categoryId);
        if (filters?.difficulty) params.set('difficulty', filters.difficulty);
        if (filters?.status)     params.set('isActive', filters.status === 'ACTIVE' ? 'true' : 'false');
        const url = `${API_ENDPOINTS.questions.list}?${params.toString()}`;
        return apiFetch(url).then(extractPaginated);
    },

    getById: (id: string): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.byId(id)),

    create: (data: IQuestionFormData): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.create, { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<IQuestionFormData>): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.update(id), { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string): Promise<void> =>
        apiFetch(API_ENDPOINTS.questions.delete(id), { method: 'DELETE' }),

    toggleActive: (id: string): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.toggleActive(id), { method: 'POST' }),

    suspend: (id: string): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.update(id), { method: 'PUT', body: JSON.stringify({ status: 'SUSPENDED' }) }),

    archive: (id: string): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.update(id), { method: 'PUT', body: JSON.stringify({ status: 'ARCHIVED' }) }),

    restore: (id: string): Promise<IQuestion> =>
        apiFetch(API_ENDPOINTS.questions.update(id), { method: 'PUT', body: JSON.stringify({ status: 'ACTIVE' }) }),

    getStats: (): Promise<IQuestionStats> =>
        questionsService.getAll(undefined, 1, 1000).then(({ data: questions }) => ({
            total:     questions.length,
            active:    questions.filter((q) => q.status === 'ACTIVE').length,
            suspended: questions.filter((q) => q.status === 'SUSPENDED').length,
            archived:  questions.filter((q) => q.status === 'ARCHIVED').length,
            premium:   questions.filter((q) => q.isPremium).length,
        })),
};