'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import { api, type QuestionPayload, type AnswerResponse, type FeedbackData } from '@/lib/api';
import { quizLogger } from '@/lib/logger';

const SESSION_STORAGE_KEY = 'ipf_quiz_session';

// ── State machine types ──
type QuizState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'answering'
  | 'feedback'
  | 'transitioning'
  | 'completed'
  | 'gameover'
  | 'error';

interface QuizEngineState {
  phase: QuizState;
  sessionId: string | null;
  categoryName: string;
  question: QuestionPayload | null;
  lives: number;
  comboCount: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  isCorrect: boolean | null;
  feedback: FeedbackData | null;
  xpEarned: number;
  totalXpSession: number;
  error: string | null;
  durationOverride: number | null;
}

type QuizAction =
  | { type: 'START_LOADING' }
  | {
      type: 'SESSION_STARTED';
      sessionId: string;
      question: QuestionPayload;
      lives: number;
      comboCount: number;
      totalQuestions: number;
      categoryName: string;
      durationOverride: number | null;
    }
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'SUBMITTING' }
  | {
      type: 'ANSWER_RESULT';
      result: AnswerResponse;
    }
  | { type: 'SHOW_FEEDBACK' }
  | { type: 'NEXT_QUESTION'; question: QuestionPayload }
  | { type: 'SESSION_COMPLETE' }
  | { type: 'GAME_OVER' }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

const initialState: QuizEngineState = {
  phase: 'idle',
  sessionId: null,
  categoryName: '',
  question: null,
  lives: 5,
  comboCount: 0,
  totalQuestions: 10,
  selectedAnswer: null,
  correctAnswer: null,
  isCorrect: null,
  feedback: null,
  xpEarned: 0,
  totalXpSession: 0,
  error: null,
  durationOverride: null,
};

function reducer(state: QuizEngineState, action: QuizAction): QuizEngineState {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, phase: 'loading', error: null };

    case 'SESSION_STARTED':
      return {
        ...state,
        phase: 'playing',
        sessionId: action.sessionId,
        question: action.question,
        lives: action.lives,
        comboCount: action.comboCount,
        totalQuestions: action.totalQuestions,
        categoryName: action.categoryName,
        durationOverride: action.durationOverride,
        selectedAnswer: null,
        correctAnswer: null,
        isCorrect: null,
        feedback: null,
      };

    case 'SELECT_ANSWER':
      // Block answer changes during submission
      return state.phase === 'playing'
        ? { ...state, selectedAnswer: action.answer }
        : state;

    case 'SUBMITTING':
      return { ...state, phase: 'answering' };

    case 'ANSWER_RESULT':
      return {
        ...state,
        phase: 'feedback',
        correctAnswer: action.result.correctAnswer,
        isCorrect: action.result.isCorrect,
        feedback: action.result.feedback,
        lives: action.result.livesRemaining,
        comboCount: action.result.comboCount,
        xpEarned: action.result.xpEarned,
        totalXpSession: state.totalXpSession + action.result.xpEarned,
      };

    case 'SHOW_FEEDBACK':
      return { ...state, phase: 'feedback' };

    case 'NEXT_QUESTION':
      return {
        ...state,
        phase: 'playing',
        question: action.question,
        selectedAnswer: null,
        correctAnswer: null,
        isCorrect: null,
        feedback: null,
        xpEarned: 0,
      };

    case 'SESSION_COMPLETE':
      return { ...state, phase: 'completed' };

    case 'GAME_OVER':
      return { ...state, phase: 'gameover' };

    case 'ERROR':
      return { ...state, phase: 'error', error: action.message };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useQuizEngine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const answerStartRef = useRef<number>(0);
  const lastResultRef = useRef<AnswerResponse | null>(null);
  const hasInitializedRef = useRef(false);

  // Persist sessionId to sessionStorage (only after initialization)
  useEffect(() => {
    // Don't clear storage on initial idle state — wait until we've tried to resume
    if (!hasInitializedRef.current) return;

    if (state.sessionId && state.phase !== 'completed' && state.phase !== 'gameover') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, state.sessionId);
    } else if (state.phase === 'completed' || state.phase === 'gameover') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [state.sessionId, state.phase]);

  // Resume existing session if available
  const resumeSession = useCallback(async (sessionId: string) => {
    dispatch({ type: 'START_LOADING' });
    try {
      const res = await api.quiz.current(sessionId);
      dispatch({
        type: 'SESSION_STARTED',
        sessionId: res.sessionId,
        question: res.question,
        lives: res.lives,
        comboCount: res.comboCount ?? 0,
        totalQuestions: res.question.totalQuestions,
        categoryName: res.categoryName ?? '',
        durationOverride: res.durationOverride ?? null,
      });
      answerStartRef.current = performance.now();
    } catch (err: any) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      throw err;
    }
  }, []);

  const startSession = useCallback(async (options: { categoryId?: string; packId?: string; mode?: 'PRACTICE' | 'DAILY' } = {}) => {
    hasInitializedRef.current = true;
    const { categoryId, packId, mode } = options;

    // Check for existing session first
    const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existingSessionId) {
      try {
        await resumeSession(existingSessionId);
        return;
      } catch (err: any) {
        quizLogger.warn('Session expirée, création nouvelle session', err.message);
      }
    }

    dispatch({ type: 'START_LOADING' });
    try {
      const res = await api.quiz.start({ categoryId, packId, mode });
      await api.quiz.ready(res.sessionId);
      dispatch({
        type: 'SESSION_STARTED',
        sessionId: res.sessionId,
        question: res.question,
        lives: res.lives,
        comboCount: 0,
        totalQuestions: res.totalQuestions,
        categoryName: res.categoryName,
        durationOverride: (res as any).durationOverride ?? null,
      });
      answerStartRef.current = performance.now();
    } catch (err: any) {
      const message = err.status === 401 
        ? 'Session expirée, veuillez vous reconnecter'
        : err.status === 404
        ? 'Catégorie non trouvée'
        : err.message || 'Erreur au démarrage du quiz';
      dispatch({ type: 'ERROR', message });
    }
  }, [resumeSession]);

  const selectAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SELECT_ANSWER', answer });
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!state.sessionId || !state.question || !state.selectedAnswer) return;

    dispatch({ type: 'SUBMITTING' });
    const responseTimeMs = Math.round(performance.now() - answerStartRef.current);

    try {
      const result = await api.quiz.answer({
        sessionId: state.sessionId,
        questionId: state.question.id,
        answer: state.selectedAnswer,
        responseTimeMs,
      });

      lastResultRef.current = result;
      dispatch({ type: 'ANSWER_RESULT', result });
    } catch (err: any) {
      const message = err.status === 400
        ? 'Session terminée ou réponse invalide'
        : err.status === 403
        ? 'Accès non autorisé à cette session'
        : err.status === 404
        ? 'Session introuvable'
        : err.message || 'Erreur lors de la soumission';
      dispatch({ type: 'ERROR', message });
    }
  }, [state.sessionId, state.question, state.selectedAnswer]);

  const skipQuestion = useCallback(async () => {
    if (!state.sessionId || !state.question) return;

    dispatch({ type: 'SUBMITTING' });
    const responseTimeMs = Math.round(performance.now() - answerStartRef.current);
    try {
      const result = await api.quiz.answer({
        sessionId: state.sessionId,
        questionId: state.question.id,
        answer: 'SKIP',
        responseTimeMs,
      });

      lastResultRef.current = result;
      dispatch({ type: 'ANSWER_RESULT', result });
    } catch (err: any) {
      const message = err.status === 403
        ? 'Accès non autorisé'
        : err.message || 'Erreur lors du passage de la question';
      dispatch({ type: 'ERROR', message });
    }
  }, [state.sessionId, state.question]);

  const handleTimeout = useCallback(async () => {
    // Timeout = auto-skip
    await skipQuestion();
  }, [skipQuestion]);

  const proceedToNext = useCallback(async () => {
    const result = lastResultRef.current;
    if (!result) return;

    if (result.isGameOver) {
      dispatch({ type: 'GAME_OVER' });
    } else if (result.isSessionComplete) {
      dispatch({ type: 'SESSION_COMPLETE' });
    } else if (result.nextQuestion) {
      if (state.sessionId) {
        try {
          await api.quiz.ready(state.sessionId);
        } catch (err: any) {
          quizLogger.warn('Échec sync timer serveur', err.message);
        }
      }
      dispatch({ type: 'NEXT_QUESTION', question: result.nextQuestion });
      answerStartRef.current = performance.now();
    }
  }, [state.sessionId]);

  const reset = useCallback(() => {
    lastResultRef.current = null;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    startSession,
    selectAnswer,
    submitAnswer,
    skipQuestion,
    handleTimeout,
    proceedToNext,
    reset,
  };
}
