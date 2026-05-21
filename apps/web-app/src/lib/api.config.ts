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
    }
        
} as const;