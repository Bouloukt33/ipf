import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
    appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3001',
    signInReturnToPath: '/auth/post-login',

    authorizationParameters: {
        ui_locales: 'fr-FR',
        audience: process.env.AUTH0_AUDIENCE || 'https://api.ipf.local',
    },
});