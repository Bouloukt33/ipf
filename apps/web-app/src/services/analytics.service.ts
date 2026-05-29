import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import {
    IAdminDashboardStats,
    IUserAnalytics,
    IUserAnalyticsDetail,
    IUserAnalyticsFilters,
} from '@/lib/user.analytics.types';

export interface IPaginatedUsers {
    data:  IUserAnalytics[];
    meta:  { total: number; page: number; limit: number; totalPages: number };
}

export const analyticsService = {
    getDashboard: (): Promise<IAdminDashboardStats> =>
        apiFetch(API_ENDPOINTS.analytics.dashboard),

    getUsers: (
        filters?: Partial<IUserAnalyticsFilters>,
        page  = 1,
        limit = 20,
    ): Promise<IPaginatedUsers> => {
        const params = new URLSearchParams();
        params.set('page',  String(page));
        params.set('limit', String(limit));
        if (filters?.search)             params.set('search',             filters.search);
        if (filters?.professionalStatus) params.set('professionalStatus', filters.professionalStatus);
        if (filters?.ageRange)           params.set('ageRange',           filters.ageRange);
        return apiFetch(`${API_ENDPOINTS.analytics.users}?${params.toString()}`);
    },

    getUserDetail: (id: string): Promise<IUserAnalyticsDetail> =>
        apiFetch(API_ENDPOINTS.analytics.userDetail(id)),

    deleteUser: (id: string): Promise<{ deleted: boolean; id: string }> =>
        apiFetch(API_ENDPOINTS.analytics.deleteUser(id), { method: 'DELETE' }),

    updateUserProfile: (id: string, data: {
        displayName?:        string;
        ageRange?:           string;
        professionalStatus?: string;
    }): Promise<unknown> =>
        apiFetch(API_ENDPOINTS.analytics.updateUserProfile(id), {
            method: 'PATCH',
            body:   JSON.stringify(data),
        }),
};
