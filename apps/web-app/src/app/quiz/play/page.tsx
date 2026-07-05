'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import Timer from '@/components/quiz/Timer';
import LivesDisplay from '@/components/quiz/LivesDisplay';
import ProgressBar from '@/components/quiz/ProgressBar';
import AnswerGrid from '@/components/quiz/AnswerGrid';
import FeedbackInline from '@/components/quiz/FeedbackInline';
import FeedbackOverlay from '@/components/quiz/FeedbackOverlay';
import MascotDisplay from '@/components/quiz/MascotDisplay';
import LoginRequired from '@/components/quiz/LoginRequired';

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const packId = searchParams.get('packId') ?? undefined;

  const {
    state,
    startSession,
    selectAnswer,
    submitAnswer,
    skipQuestion,
    handleTimeout,
    proceedToNext,
  } = useQuizEngine();

  const [overlayVisible, setOverlayVisible] = useState(false);

  // Show overlay on feedback, auto-hide after delay
  useEffect(() => {
    if (state.phase === 'feedback' && state.isCorrect !== null) {
      setOverlayVisible(true);
    }
  }, [state.phase, state.isCorrect]);

  const dismissOverlay = useCallback(() => {
    setOverlayVisible(false);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Handled by LoginRequired component below
  }, [authLoading, user]);

  // Start session on mount (only if authenticated)
  useEffect(() => {
    if (state.phase === 'idle' && user && !authLoading) {
      startSession({ categoryId, packId });
    }
  }, [state.phase, categoryId, packId, startSession, user, authLoading]);

  // Redirect on completion/gameover
  useEffect(() => {
    if (
      (state.phase === 'completed' || state.phase === 'gameover') &&
      state.sessionId
    ) {
      router.push(`/quiz/completion?sessionId=${state.sessionId}`);
    }
  }, [state.phase, state.sessionId, router]);

  // Loading auth
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <MascotDisplay variant="go" size={180} className="mx-auto mb-6" />
          <p className="text-xl font-bold text-navy">Préparation du quiz...</p>
          <div className="mt-4 w-16 h-1 bg-primary rounded-full mx-auto animate-shimmer" />
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginRequired returnTo={`/quiz/play${categoryId ? `?categoryId=${categoryId}` : ''}`} />;
  }

  // Loading session
  if (state.phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <MascotDisplay variant="go" size={180} className="mx-auto mb-6" />
          <p className="text-xl font-bold text-navy">Préparation du quiz...</p>
          <div className="mt-4 w-16 h-1 bg-primary rounded-full mx-auto animate-shimmer" />
        </div>
      </main>
    );
  }

  // Error state — show error with no auto-retry
  if (state.phase === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <MascotDisplay variant="sad" size={150} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">Oops !</h2>
          <p className="text-charcoal/70 mb-6">{state.error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/quiz/selection')}
              className="px-6 py-3 border-2 border-navy/20 text-navy font-bold rounded-xl hover:bg-navy/5 transition-all"
            >
              Retour
            </button>
            <button
              onClick={() => startSession({ categoryId, packId })}
              className="px-8 py-3 bg-gradient-primary text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!state.question) return null;

  const isTimerRunning = state.phase === 'playing';
  const isAnswerDisabled = state.phase !== 'playing';
  const showFeedback = state.phase === 'feedback';

  const options = [
    { key: 'A', text: state.question.optionA },
    { key: 'B', text: state.question.optionB },
    { key: 'C', text: state.question.optionC },
    { key: 'D', text: state.question.optionD },
  ];

  const mascotVariant = showFeedback
    ? state.isCorrect
      ? 'bravo'
      : 'encourage'
    : 'thinking';
  const mascotMessage = showFeedback
    ? state.isCorrect
      ? 'Bravo ! 🎉'
      : 'Courage, tu vas y arriver !'
    : state.comboCount >= 3
      ? `Combo x${state.comboCount} ! 🔥`
      : undefined;

  return (
    <main className="min-h-screen px-3 py-4 sm:px-6 sm:py-8 pb-24 md:pb-8 max-w-3xl mx-auto font-nunito flex flex-col">
      {/* Arène de jeu — carte navy inspirée du mock de la landing */}
      <div
        className="relative flex-1 flex flex-col overflow-hidden rounded-[28px] sm:rounded-[36px]
          bg-gradient-hero shadow-card px-4 py-5 sm:px-8 sm:py-8 animate-fade-in-up"
      >
        <div aria-hidden className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-28 -left-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative flex-1 flex flex-col">
          {/* Header : Quitter + Catégorie + Vies */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-5">
            <button
              onClick={() => router.push('/quiz')}
              className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-white/70
                hover:bg-white/20 hover:text-white transition-colors flex-shrink-0"
              aria-label="Quitter le quiz"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-3 sm:px-4 py-1.5 bg-primary/15 text-primary-light text-xs sm:text-sm
                font-black uppercase tracking-wider rounded-full truncate">
                {state.categoryName}
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />
                <span className="text-xs text-white/40 font-bold">Live</span>
              </span>
            </div>
            <LivesDisplay lives={state.lives} />
          </div>

          {/* Progression */}
          <div className="flex items-center gap-3 mb-6">
            <ProgressBar
              current={state.question.questionNumber}
              total={state.totalQuestions}
              className="flex-1"
            />
            <span className="text-[12px] font-black text-white/50 tabular-nums whitespace-nowrap">
              {state.question.questionNumber}/{state.totalQuestions}
            </span>
          </div>

          {/* Timer + combo */}
          <div className="relative flex items-center justify-center mb-5 sm:mb-6">
            <Timer
              key={state.question.id}
              duration={state.durationOverride || 5}
              isRunning={isTimerRunning}
              onTimeout={handleTimeout}
            />
            {state.comboCount >= 2 && (
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1
                  px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/25
                  text-amber-300 text-[11px] sm:text-xs font-black animate-scale-in"
              >
                🔥 x{state.comboCount}
              </span>
            )}
          </div>

          {/* Question */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-lg sm:text-2xl font-extrabold text-white leading-relaxed">
              {state.question.text}
            </p>
          </div>

          {/* Answer Grid */}
          <AnswerGrid
            options={options}
            selected={state.selectedAnswer}
            correctAnswer={showFeedback ? state.correctAnswer : null}
            disabled={isAnswerDisabled}
            onSelect={selectAnswer}
          />

          {/* Inline Feedback */}
          {showFeedback && state.isCorrect !== null && (
            <FeedbackInline
              isCorrect={state.isCorrect}
              correctAnswer={options.find(o => o.key === state.correctAnswer)?.text ?? state.correctAnswer ?? ''}
              feedback={state.feedback}
            />
          )}

          {/* Action Buttons */}
          <div className="mt-auto pt-6 flex justify-center gap-3 sm:gap-4">
            {state.phase === 'playing' && (
              <>
                <button
                  onClick={skipQuestion}
                  className="px-5 sm:px-6 py-3 rounded-2xl border border-white/20 bg-white/5 text-white/70
                    font-bold hover:bg-white/15 hover:text-white transition-colors"
                >
                  Passer
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!state.selectedAnswer}
                  className="flex-1 sm:flex-none sm:px-12 py-3 bg-gradient-primary text-white font-extrabold rounded-2xl
                    shadow-primary transition-transform motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97]
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Valider
                </button>
              </>
            )}
            {state.phase === 'feedback' && (
              <button
                onClick={() => {
                  setOverlayVisible(false);
                  proceedToNext();
                }}
                className="flex-1 sm:flex-none sm:px-12 py-3 bg-gradient-primary text-white font-extrabold rounded-2xl
                  shadow-primary transition-transform motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97]
                  animate-fade-in-up"
              >
                Continuer →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Side Mascot (desktop only) */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-[15] transition-all duration-600">
        <MascotDisplay
          variant={mascotVariant}
          message={mascotMessage}
          size={180}
        />
      </div>

      {/* Feedback Overlay — auto-dismiss, then user clicks Continuer */}
      {overlayVisible && state.isCorrect !== null && (
        <FeedbackOverlay
          isCorrect={state.isCorrect}
          show={true}
          onDismiss={dismissOverlay}
          autoDismissMs={1500}
        />
      )}
    </main>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-navy font-bold">Chargement...</p>
        </main>
      }
    >
      <QuizPlayContent />
    </Suspense>
  );
}
