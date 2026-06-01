import { ENV } from './env';

export const AUTH0_SCOPE = 'openid profile email read:admin write:questions';

export const auth0ProviderConfig = {
  domain: ENV.auth0Domain,
  clientId: ENV.auth0ClientId,
  authorizationParams: {
    redirect_uri: `${window.location.origin}/admin/dashboard`,
    audience: ENV.auth0Audience,
    scope: AUTH0_SCOPE,
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
};
