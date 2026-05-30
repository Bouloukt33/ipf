import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AUTH0_SCOPE } from '../lib/auth0';
import { ENV } from '../lib/env';
import { isAdminToken } from '../lib/auth';

interface AdminGateProps {
  children: ReactNode;
}

type AdminState = 'idle' | 'checking' | 'allowed' | 'denied';

export function AdminGate({ children }: AdminGateProps) {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
  } = useAuth0();
  const [adminState, setAdminState] = useState<AdminState>('idle');
  const [error, setError] = useState<string | null>(null);

  const loginUrl = useMemo(() => window.location.origin, []);

  useEffect(() => {
    let active = true;

    console.log('[AdminGate] Check:', { isAuthenticated, isLoading });

    if (!isAuthenticated) {
      setAdminState('idle');
      return;
    }

    setAdminState('checking');

    getAccessTokenSilently({
      authorizationParams: {
        audience: ENV.auth0Audience,
        scope: AUTH0_SCOPE,
      },
    })
      .then((token) => {
        if (!active) return;
        const isAd = isAdminToken(token);
        console.log('[AdminGate] Token received, isAdmin:', isAd);
        setAdminState(isAd ? 'allowed' : 'denied');
      })
      .catch((err: Error) => {
        if (!active) return;
        console.error('[AdminGate] Token error:', err);
        setError(err.message || 'Erreur de session');
        setAdminState('denied');
      });

    return () => {
      active = false;
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  if (isLoading || adminState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-panel rounded-3xl px-10 py-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.25em] text-ink-500">
            Verification
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink-900">
            Controle des acces en cours
          </h1>
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-copper-400 to-tide-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-panel w-full max-w-xl rounded-3xl p-10 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-500">
            IPF Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink-900">
            Connexion requise
          </h1>
          <p className="mt-3 text-sm text-ink-600">
            Accedez au dashboard securise pour gerer les questions.
          </p>
          <button
            className="mt-6 inline-flex items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            onClick={() =>
              loginWithRedirect({
                authorizationParams: {
                  redirect_uri: `${loginUrl}/admin/dashboard`,
                  audience: ENV.auth0Audience,
                  scope: AUTH0_SCOPE,
                },
              })
            }
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (adminState === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-panel w-full max-w-2xl rounded-3xl p-10 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-500">
            Acces refuse
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink-900">
            403 - Zone Admin uniquement
          </h1>
          <p className="mt-3 text-sm text-ink-600">
            Votre session ne contient pas le role Admin requis.
          </p>
          {error ? (
            <p className="mt-3 text-xs text-ink-500">{error}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700 transition hover:-translate-y-0.5"
              onClick={() => (window.location.href = '/')}
            >
              Retour accueil
            </button>
            <button
              className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={() => logout({ logoutParams: { returnTo: loginUrl } })}
            >
              Changer de compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
