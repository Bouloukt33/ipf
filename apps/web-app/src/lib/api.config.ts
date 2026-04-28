/**
 * Point de sortie centralisé pour toutes les requêtes API.
 * Tous les fichiers d'appels API doivent importer depuis ce fichier.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const API_ENDPOINTS = {
    auth: {
        syncUser: '/auth/sync-user',
        me: '/auth/me',
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
        update: (id: string) => `/progression/${id}`,
    },

    leaderboard: {
        global: '/leaderboard',
        podium: '/leaderboard/podium',
        byTheme: (theme: string) => `/leaderboard/${theme}`,
    },
} as const;