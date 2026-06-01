import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import {
    IAdminPlan,
    IEmailTemplate,
    IEmailTemplatePreview,
    IProspect,
    ISubscriptionFilters,
    ISubscriptionUser,
    EmailTemplateId,
} from '@/lib/subscription.types';

export interface IPaginatedSubscriptions {
    data: ISubscriptionUser[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const subscriptionsAdminService = {
    getAll: (filters?: Partial<ISubscriptionFilters>, page = 1, limit = 20): Promise<IPaginatedSubscriptions> => {
        const params = new URLSearchParams();
        params.set('page',  String(page));
        params.set('limit', String(limit));
        if (filters?.search)   params.set('search',   filters.search);
        if (filters?.planSlug) params.set('planSlug', filters.planSlug);
        if (filters?.status)   params.set('status',   filters.status);
        return apiFetch(`${API_ENDPOINTS.subscriptions.list}?${params.toString()}`);
    },

    getProspects: (): Promise<{ upsell: IProspect[]; coaching: IProspect[] }> =>
        apiFetch(API_ENDPOINTS.subscriptions.prospects),

    cancel: (subscriptionId: string): Promise<{ id: string; status: string }> =>
        apiFetch(API_ENDPOINTS.subscriptions.cancel(subscriptionId), { method: 'POST' }),

    changePlan: (subscriptionId: string, planId: string): Promise<{ id: string; planId: string }> =>
        apiFetch(API_ENDPOINTS.subscriptions.changePlan(subscriptionId), {
            method: 'PATCH',
            body:   JSON.stringify({ planId }),
        }),
};

export const plansAdminService = {
    getAll: (): Promise<IAdminPlan[]> =>
        apiFetch(API_ENDPOINTS.plans.list),

    create: (data: {
        name: string; slug: string; description?: string; price: number;
        currency?: string; intervalMonths?: number; features?: string[];
        stripePriceId?: string; isActive?: boolean; order?: number;
    }): Promise<IAdminPlan> =>
        apiFetch(API_ENDPOINTS.plans.create, {
            method: 'POST',
            body:   JSON.stringify(data),
        }),

    update: (id: string, data: Partial<{
        name: string; description: string; price: number;
        features: string[]; isActive: boolean; order: number;
    }>): Promise<IAdminPlan> =>
        apiFetch(API_ENDPOINTS.plans.update(id), {
            method: 'PUT',
            body:   JSON.stringify(data),
        }),

    delete: (id: string): Promise<{ deleted: boolean; id: string }> =>
        apiFetch(API_ENDPOINTS.plans.delete(id), { method: 'DELETE' }),
};

export const emailAdminService = {
    getTemplates: (): Promise<IEmailTemplate[]> =>
        apiFetch(API_ENDPOINTS.email.templates),

    preview: (id: EmailTemplateId): Promise<IEmailTemplatePreview> =>
        apiFetch(API_ENDPOINTS.email.preview(id)),

    sendToUser: (userId: string, templateId: EmailTemplateId): Promise<{ sent: boolean; to: string; subject: string }> =>
        apiFetch(API_ENDPOINTS.email.sendToUser(userId), {
            method: 'POST',
            body: JSON.stringify({ templateId }),
        }),

    sendToSegment: (segment: 'upsell' | 'coaching', templateId: EmailTemplateId): Promise<{ total: number; sent: number }> =>
        apiFetch(API_ENDPOINTS.email.sendToSegment, {
            method: 'POST',
            body: JSON.stringify({ segment, templateId }),
        }),
};
