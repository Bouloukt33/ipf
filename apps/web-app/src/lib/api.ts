import { getAccessToken } from '@auth0/nextjs-auth0/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_PREFIX = '/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token: string | null = null;
  try {
    token = await getAccessToken();
  } catch {
    // Not logged in — continue without token
  }

  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || res.statusText);
  }

  return res.json();
}

// ── Quiz API ──

export interface StartSessionPayload {
  categoryId?: string;
  mode?: 'PRACTICE' | 'DAILY';
}

export interface QuestionPayload {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  questionNumber: number;
  totalQuestions: number;
}

export interface StartSessionResponse {
  sessionId: string;
  question: QuestionPayload;
  totalQuestions: number;
  lives: number;
  mode: string;
  categoryName: string;
}

export interface AnswerPayload {
  sessionId: string;
  questionId: string;
  answer: string;
  responseTimeMs: number;
}

export interface FeedbackData {
  keyMessage: string | null;
  essentialPoints: string[] | null;
  example: string | null;
  trap: string | null;
}

export interface AnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  xpEarned: number;
  comboCount: number;
  livesRemaining: number;
  isGameOver: boolean;
  isSessionComplete: boolean;
  feedback: FeedbackData | null;
  nextQuestion: QuestionPayload | null;
}

export interface CompletionResponse {
  sessionId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  accuracy: number;
  averageTimeMs: number;
  bestCombo: number;
  livesRemaining: number;
  xpTotal: number;
  level: number;
  leveledUp: boolean;
  previousLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  streakDays: number;
  mascotRange: 'sad' | 'moderate' | 'good' | 'great' | 'perfect';
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  isPremium: boolean;
}

export const api = {
  quiz: {
    start: (payload: StartSessionPayload) =>
      request<StartSessionResponse>('/quiz/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    answer: (payload: AnswerPayload) =>
      request<AnswerResponse>('/quiz/answer', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    complete: (sessionId: string) =>
      request<CompletionResponse>(`/quiz/${sessionId}/complete`, {
        method: 'POST',
      }),

    review: (sessionId: string) =>
      request<any>(`/quiz/${sessionId}/review`),

    current: (sessionId: string) =>
      request<any>(`/quiz/${sessionId}/current`),

    history: (limit = 10) =>
      request<any[]>(`/quiz/history?limit=${limit}`),
  },

  categories: {
    list: () => request<CategoryData[]>('/categories'),
  },
};
