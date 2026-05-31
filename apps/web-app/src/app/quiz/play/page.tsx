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
    <main className="min-h-screen px-4 py-6 max-w-3xl mx-auto font-nunito">
      {/* Header: Close + Progress + Lives */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/quiz')}
          className="p-2 rounded-xl hover:bg-navy/5 transition-colors"
          aria-label="Quitter le quiz"
        >
          <svg className="w-6 h-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <ProgressBar
          current={state.question.questionNumber}
          total={state.totalQuestions}
          className="flex-1"
        />
        <LivesDisplay lives={state.lives} />
      </div>

      {/* Timer */}
      <div className="mb-6">
        <Timer duration={state.durationOverride || 5} isRunning={isTimerRunning} onTimeout={handleTimeout} />
      </div>

      {/* Category Badge */}
      <div className="text-center mb-3">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
          {state.categoryName}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <p className="text-xl md:text-2xl font-extrabold text-navy leading-relaxed">
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
      <div className="flex justify-center gap-4 mt-6">
        {state.phase === 'playing' && (
          <>
            <button
              onClick={skipQuestion}
              className="px-6 py-3 border-2 border-navy/20 text-navy/60 font-bold rounded-xl hover:bg-navy/5 transition-all"
            >
              Passer
            </button>
            <button
              onClick={submitAnswer}
              disabled={!state.selectedAnswer}
              className="px-10 py-3 bg-gradient-primary text-white font-extrabold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-primary-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
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
            className="px-10 py-3 bg-gradient-primary text-white font-extrabold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-primary-lg animate-fade-in-up"
          >
            Continuer →
          </button>
        )}
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
