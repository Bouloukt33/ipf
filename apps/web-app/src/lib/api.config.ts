export const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
    auth: {
        syncUser: '/sync-user',
        me: '/sync-user',
    },

    user: {
        profile: '/users/profile',
        update: '/users/profile',
    },

    dashboard: {
        stats: '/dashboard/stats',
        achievements: '/dashboard/achievements',
        streak: '/dashboard/streak',
    },

    themes: {
        list: '/themes',
        bySlug: (slug: string) => `/themes/${slug}`,
    },

    progression: {
        list: '/progression',
        byMonth: (month: string) => `/progression/${month}`,
        themes: '/progression/themes',         
        update: (id: string) => `/progression/${id}`,
    },

    leaderboard: {
        global: '/leaderboard',
        podium: '/leaderboard/podium',
        preview: '/leaderboard/preview',       
        byTheme: (theme: string) => `/leaderboard/${theme}`,
    },

    profile: {
        me:                 '/profile/me',
        update:             '/profile/me',
        paymentMethod:      '/profile/payment-method',
        plans:              '/profile/plans',
        choosePlan:         '/profile/plans/choose',
        cancelSubscription: '/profile/subscription/cancel',
    },

    questions: {
        list:         '/questions',
        byId:         (id: string) => `/questions/${id}`,
        create:       '/questions',
        update:       (id: string) => `/questions/${id}`,
        delete:       (id: string) => `/questions/${id}`,
        toggleActive: (id: string) => `/questions/${id}/toggle-active`,
    },

    categories: {
        list: '/categories',
    },

    adminCategories: {
        list:         '/admin/categories',
        create:       '/admin/categories',
        update:       (id: string) => `/admin/categories/${id}`,
        toggleActive: (id: string) => `/admin/categories/${id}/toggle-active`,
    },

    subscriptions: {
        list:             '/admin/subscriptions',
        prospects:        '/admin/subscriptions/prospects',
    },

    plans: {
        list:   '/admin/plans',
        update: (id: string) => `/admin/plans/${id}`,
    },

    email: {
        templates:       '/admin/email/templates',
        preview:         (id: string) => `/admin/email/templates/${id}/preview`,
        sendToUser:      (userId: string) => `/admin/email/send/user/${userId}`,
        sendToSegment:   '/admin/email/send/segment',
    },

    analytics: {
        dashboard:      '/admin/dashboard',
        questionStats:  '/admin/questions/stats',
        users:          '/admin/users',
        userDetail:     (id: string) => `/admin/users/${id}`,
    },

    packs: {
        list:           '/packs',
        byId:           (id: string) => `/packs/${id}`,
        bySlug:         (categorySlug: string, packSlug: string) => `/packs/slug/${categorySlug}/${packSlug}`,
        create:         '/packs',
        update:         (id: string) => `/packs/${id}`,
        delete:         (id: string) => `/packs/${id}`,
        toggleActive:   (id: string) => `/packs/${id}/toggle-active`,
        addQuestions:   (id: string) => `/packs/${id}/questions`,
        removeQuestion: (id: string, questionId: string) => `/packs/${id}/questions/${questionId}`,
    },

} as const;