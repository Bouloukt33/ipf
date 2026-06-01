import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { isAdminToken } from '../lib/auth';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: ENV.auth0Audience,
            scope: AUTH0_SCOPE,
          },
        });
        setIsAdmin(isAdminToken(token));
      } catch (err) {
        console.error('[AdminGuard] Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    }

    if (!isLoading) {
      checkAdmin();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F5F1]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
          <span className="text-[16px] font-black text-[#172E42] tracking-wider uppercase">Vérification des droits…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F5F1] p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-[32px] shadow-soft border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-black text-[#172E42] mb-3">Accès Refusé</h1>
          <p className="text-[15px] font-semibold text-[#5a7a99] mb-8 leading-relaxed">
            Votre compte ne possède pas les permissions nécessaires pour accéder à l'interface d'administration.
          </p>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="w-full h-[52px] rounded-[16px] border-none bg-[#172E42] font-extrabold text-[15px] text-white cursor-pointer transition-all hover:bg-black"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
