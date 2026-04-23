'use client';

import MascotDisplay from './MascotDisplay';

interface LoginRequiredProps {
  message?: string;
  returnTo?: string;
}

export default function LoginRequired({
  message = 'Connecte-toi pour accéder au quiz et commencer à\u00a0apprendre\u00a0!',
  returnTo = '/quiz/selection',
}: LoginRequiredProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Mascot + speech bubble side by side */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="bg-white px-5 py-4 rounded-[20px] border-[3px] border-primary shadow-lg max-w-[240px]">
              <p className="text-sm font-bold text-navy leading-relaxed">
                Hé ! On se connaît pas encore 👋
              </p>
            </div>
            {/* Arrow pointing right toward mascot */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-r-[3px] border-b-[3px] border-primary rotate-[-45deg]" />
          </div>

          <MascotDisplay
            variant="welcome"
            size={180}
          />
        </div>

        <h2 className="text-2xl font-extrabold text-navy mb-3">
          Connexion requise
        </h2>
        <p className="text-charcoal/70 font-semibold mb-8 leading-relaxed">
          {message}
        </p>
        <a
          href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-primary text-white text-lg font-extrabold rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Se connecter
        </a>
        <p className="mt-6 text-sm text-charcoal/40 font-medium">
          C&apos;est gratuit et ça prend 30 secondes ⚡
        </p>
      </div>
    </main>
  );
}
