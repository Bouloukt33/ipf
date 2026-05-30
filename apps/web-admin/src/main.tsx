import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { auth0ProviderConfig } from './lib/auth0';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const isConfigured =
  Boolean(auth0ProviderConfig.domain) &&
  Boolean(auth0ProviderConfig.clientId) &&
  Boolean(auth0ProviderConfig.authorizationParams.audience);

createRoot(root).render(
  <StrictMode>
    {isConfigured ? (
      <Auth0Provider {...auth0ProviderConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 text-ink-900">
        <div className="max-w-lg rounded-3xl border border-ink-100 bg-white/80 p-8 shadow-soft">
          <h1 className="text-2xl font-semibold">Config Auth0 manquante</h1>
          <p className="mt-3 text-sm text-ink-600">
            Definis VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, et VITE_AUTH0_AUDIENCE
            pour demarrer le dashboard admin.
          </p>
        </div>
      </div>
    )}
  </StrictMode>,
);
