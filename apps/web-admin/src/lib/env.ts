export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN,
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  auth0RoleClaim:
    import.meta.env.VITE_AUTH0_ROLE_CLAIM || 'https://ipf.com/roles',
};
