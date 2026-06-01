import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { auth0ProviderConfig } from './lib/auth0';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider {...auth0ProviderConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
);
