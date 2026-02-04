import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
    appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3001',
    signInReturnToPath: '/dashboard',
    
    // Personnalisation du formulaire Auth0
    authorizationParameters: {
        // Passe des paramètres pour personnaliser l'UI
        ui_locales: 'fr', // Interface en français
    },
});