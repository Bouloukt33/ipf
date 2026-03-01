'use client';

import { useReducer, useCallback, useRef } from 'react';
import { api, type QuestionPayload, type AnswerResponse, type FeedbackData } from '@/lib/api';

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
}

type QuizAction =
  | { type: 'START_LOADING' }
  | {
      type: 'SESSION_STARTED';
      sessionId: string;
      question: QuestionPayload;
      lives: number;
      totalQuestions: number;
      categoryName: string;
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
        totalQuestions: action.totalQuestions,
        categoryName: action.categoryName,
        selectedAnswer: null,
        correctAnswer: null,
        isCorrect: null,
        feedback: null,
      };

    case 'SELECT_ANSWER':
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

  const startSession = useCallback(async (categoryId?: string, mode?: 'PRACTICE' | 'DAILY') => {
    dispatch({ type: 'START_LOADING' });
    try {
      const res = await api.quiz.start({ categoryId, mode });
      dispatch({
        type: 'SESSION_STARTED',
        sessionId: res.sessionId,
        question: res.question,
        lives: res.lives,
        totalQuestions: res.totalQuestions,
        categoryName: res.categoryName,
      });
      answerStartRef.current = performance.now();
    } catch (err: any) {
      dispatch({ type: 'ERROR', message: err.message || 'Erreur au démarrage' });
    }
  }, []);

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
      dispatch({ type: 'ERROR', message: err.message || 'Erreur de soumission' });
    }
  }, [state.sessionId, state.question, state.selectedAnswer]);

  const skipQuestion = useCallback(async () => {
    if (!state.sessionId || !state.question) return;

    dispatch({ type: 'SUBMITTING' });
    try {
      const result = await api.quiz.answer({
        sessionId: state.sessionId,
        questionId: state.question.id,
        answer: 'SKIP',
        responseTimeMs: 5000,
      });

      lastResultRef.current = result;
      dispatch({ type: 'ANSWER_RESULT', result });
    } catch (err: any) {
      dispatch({ type: 'ERROR', message: err.message || 'Erreur' });
    }
  }, [state.sessionId, state.question]);

  const handleTimeout = useCallback(async () => {
    // Timeout = auto-skip
    await skipQuestion();
  }, [skipQuestion]);

  const proceedToNext = useCallback(() => {
    const result = lastResultRef.current;
    if (!result) return;

    if (result.isGameOver) {
      dispatch({ type: 'GAME_OVER' });
    } else if (result.isSessionComplete) {
      dispatch({ type: 'SESSION_COMPLETE' });
    } else if (result.nextQuestion) {
      dispatch({ type: 'NEXT_QUESTION', question: result.nextQuestion });
      answerStartRef.current = performance.now();
    }
  }, []);

  const reset = useCallback(() => {
    lastResultRef.current = null;
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
