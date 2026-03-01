'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { api, type CompletionResponse } from '@/lib/api';
import MascotDisplay from '@/components/quiz/MascotDisplay';

function CompletionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [data, setData] = useState<CompletionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Session introuvable');
      setLoading(false);
      return;
    }

    api.quiz
      .complete(sessionId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <MascotDisplay variant="thinking" size={150} className="mx-auto mb-4" />
          <p className="text-lg font-bold text-navy">Calcul des résultats...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <MascotDisplay variant="sad" size={150} className="mx-auto mb-4" />
          <p className="text-xl font-bold text-navy mb-4">{error || 'Erreur'}</p>
          <button
            onClick={() => router.push('/quiz')}
            className="px-8 py-3 bg-gradient-primary text-white font-bold rounded-xl"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }

  const xpProgress =
    data.xpForNextLevel > data.xpForCurrentLevel
      ? ((data.xpTotal - data.xpForCurrentLevel) /
          (data.xpForNextLevel - data.xpForCurrentLevel)) *
        100
      : 100;

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto font-nunito">
      {/* Mascot by score */}
      <div className="text-center mb-8 animate-fade-in-up">
        <MascotDisplay
          variant={data.mascotRange}
          size={200}
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl font-black text-navy mb-1">
          {data.mascotRange === 'perfect' && '🏆 Félicitations !'}
          {data.mascotRange === 'great' && '👏 Bravo !'}
          {data.mascotRange === 'good' && '💪 Bien joué !'}
          {data.mascotRange === 'moderate' && '📚 Continue comme ça !'}
          {data.mascotRange === 'sad' && '😤 Tu feras mieux !'}
        </h1>
        <p className="text-charcoal/70 font-semibold">
          {data.score}/{data.totalQuestions} bonnes réponses
        </p>
      </div>

      {/* XP & Accuracy cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up [animation-delay:200ms] opacity-0">
        <div className="bg-white rounded-2xl p-5 border-2 border-primary/20 text-center shadow-soft">
          <p className="text-3xl font-black text-primary">{data.xpEarned}</p>
          <p className="text-sm font-bold text-navy/60 uppercase tracking-wide">XP Gagnés</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/20 text-center shadow-soft">
          <p className="text-3xl font-black text-emerald-500">{data.accuracy}%</p>
          <p className="text-sm font-bold text-navy/60 uppercase tracking-wide">Précision</p>
        </div>
      </div>

      {/* Detailed stats */}
      <div className="bg-white rounded-2xl p-6 border-2 border-navy/10 mb-6 animate-fade-in-up [animation-delay:350ms] opacity-0 shadow-soft">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-500">{data.score}</p>
            <p className="text-xs font-bold text-navy/50">Bonnes</p>
          </div>
          <div>
            <p className="text-2xl font-black text-red-500">
              {data.totalQuestions - data.score}
            </p>
            <p className="text-xs font-bold text-navy/50">Mauvaises</p>
          </div>
          <div>
            <p className="text-2xl font-black text-primary">
              {(data.averageTimeMs / 1000).toFixed(1)}s
            </p>
            <p className="text-xs font-bold text-navy/50">Temps moy.</p>
          </div>
        </div>
        {data.bestCombo > 1 && (
          <p className="text-center mt-3 text-sm font-bold text-amber-600">
            🔥 Meilleur combo : x{data.bestCombo}
          </p>
        )}
      </div>

      {/* Level-up notification */}
      {data.leveledUp && (
        <div className="bg-gradient-to-r from-primary to-amber-500 rounded-2xl p-5 mb-6 text-center text-white animate-scale-in shadow-primary">
          <p className="text-2xl font-black">🎉 Level Up !</p>
          <p className="font-bold">
            Niveau {data.previousLevel} → Niveau {data.level}
          </p>
        </div>
      )}

      {/* XP Progress bar */}
      <div className="bg-white rounded-2xl p-5 border-2 border-navy/10 mb-6 animate-fade-in-up [animation-delay:500ms] opacity-0 shadow-soft">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-navy">Niveau {data.level}</span>
          <span className="text-sm font-bold text-navy/50">
            {data.xpTotal} / {data.xpForNextLevel} XP
          </span>
        </div>
        <div className="h-3 bg-primary/15 rounded-full overflow-hidden border border-primary/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-[width] duration-1000 ease-out"
            style={{
              width: `${Math.min(xpProgress, 100)}%`,
              boxShadow: '0 2px 8px rgba(210,122,45,0.4)',
            }}
          />
        </div>
      </div>

      {/* Video placeholder (locked) */}
      <div className="bg-white/80 rounded-2xl p-6 border-2 border-navy/10 mb-6 text-center opacity-60 animate-fade-in-up [animation-delay:650ms]">
        <div className="w-16 h-16 mx-auto mb-3 bg-navy/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-navy/40" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="font-bold text-navy/60 mb-1">🎥 Vidéos explicatives</p>
        <p className="text-sm text-navy/40">
          Accédez aux vidéos du formateur avec l&apos;abonnement Premium
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up [animation-delay:800ms] opacity-0">
        <button
          onClick={() => router.push('/quiz')}
          className="flex-1 px-6 py-4 bg-gradient-primary text-white font-extrabold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-primary-lg text-lg"
        >
          Continuer
        </button>
        <button
          onClick={() =>
            router.push(`/quiz/review?sessionId=${data.sessionId}`)
          }
          className="flex-1 px-6 py-4 border-2 border-primary text-primary font-extrabold rounded-2xl transition-all hover:bg-primary/5 text-lg"
        >
          Revoir les réponses
        </button>
      </div>

      {/* Streak info */}
      {data.streakDays > 0 && (
        <p className="text-center mt-6 text-sm font-bold text-amber-600 animate-fade-in-up [animation-delay:1000ms] opacity-0">
          🔥 Série de {data.streakDays} jour{data.streakDays > 1 ? 's' : ''} consécutif{data.streakDays > 1 ? 's' : ''} !
        </p>
      )}
    </main>
  );
}

export default function CompletionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-navy font-bold">Chargement...</p>
        </main>
      }
    >
      <CompletionContent />
    </Suspense>
  );
}
