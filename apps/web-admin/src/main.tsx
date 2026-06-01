import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App'
import { auth0ProviderConfig } from './lib/auth0'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider {...auth0ProviderConfig}>
      <App />
    </Auth0Provider>
  </StrictMode>,
)
