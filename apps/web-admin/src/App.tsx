import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import { AdminGate } from './components/AdminGate';
import { AdminDashboard } from './pages/AdminDashboard';
import { AUTH0_SCOPE } from './lib/auth0';
import { ENV } from './lib/env';

function Landing() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="glass-panel rounded-3xl p-10 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-500">
            IPF Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">
            Tableau de bord securise
          </h1>
          <p className="mt-4 text-sm text-ink-600">
            Connectez-vous pour acceder a la gestion des questions et au suivi
            des metadonnees.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: {
                    redirect_uri: `${window.location.origin}/admin/dashboard`,
                    audience: ENV.auth0Audience,
                    scope: AUTH0_SCOPE,
                  },
                })
              }
            >
              Se connecter
            </button>
            <a
              href="/admin/dashboard"
              className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 transition hover:-translate-y-0.5"
            >
              Aller au dashboard
            </a>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            'Controle des roles Admin',
            'Liste et filtres rapides',
            'Edition et codification auto',
          ].map((text) => (
            <div
              key={text}
              className="glass-panel rounded-2xl p-6 text-sm text-ink-600"
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminGate>
            <AdminDashboard />
          </AdminGate>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
