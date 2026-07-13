import { getAccessToken } from '@auth0/nextjs-auth0/client';
import { apiLogger } from './logger';

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
    // User not authenticated — continue without token for public endpoints
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
    apiLogger.warn(`Request failed: ${path}`, { status: res.status });
    throw new ApiError(res.status, body.message || res.statusText);
  }

  return res.json();
}

// ── Quiz API ──

export interface StartSessionPayload {
  categoryId?: string;
  packId?: string;
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

export type PackType = 'STANDARD' | 'VISITEUR' | 'PREMIUM';

export interface PackData {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  type: PackType;
  isFree: boolean;
  price: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  category: CategoryData;
  _count?: { questions: number };
}

export interface PackWithQuestions extends PackData {
  questions: Array<{
    id: string;
    text: string;
    level: number;
    isPremium: boolean;
    isActive: boolean;
    theme: { id: string; name: string; slug: string } | null;
  }>;
}

export interface CreatePackPayload {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  type?: PackType;
  isFree?: boolean;
  price?: number;
  order?: number;
}

export type UpdatePackPayload = Partial<CreatePackPayload> & { isActive?: boolean };

export interface JobProfileData {
  id: string;
  name: string;
  slug: string;
}

export interface JobSectorData {
  id: string;
  name: string;
  slug: string;
  order: number;
  jobProfiles: JobProfileData[];
}

export interface LabelValue {
  value: string;
  label: string;
}

export interface UserProfileData {
  id: string;
  displayName: string | null;
  ageRange: string | null;
  professionalStatus: string | null;
  jobProfileId: string | null;
  jobProfile: (JobProfileData & { sector: { id: string; name: string } }) | null;
}

export interface ProfileData {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  ageRange: string | null;
  professionalStatus: string | null;
  jobProfileId: string | null;
  level: number;
  xpTotal: number;
  streakDays: number;
  subscription: {
    plan: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  } | null;
}

export interface ProfileUpdateResponse {
  displayName: string | null;
  avatarUrl: string | null;
  ageRange: string | null;
  professionalStatus: string | null;
  jobProfileId: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: string[];
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscription: {
    plan: string;
    status: string;
    endDate: string;
  } | null;
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

    ready: (sessionId: string) =>
      request<{ ok: boolean }>(`/quiz/${sessionId}/ready`, {
        method: 'POST',
      }),
  },

  profile: {
    get: () => request<ProfileData>('/profile/me'),
    update: (data: {
      displayName?: string;
      avatarUrl?: string;
      ageRange?: string;
      professionalStatus?: string;
      jobProfileId?: string;
    }) => request<ProfileUpdateResponse>('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  subscription: {
    getPlans: () => request<SubscriptionPlan[]>('/subscription/plans'),
    getStatus: () => request<SubscriptionStatus>('/subscription/status'),
  },

  payment: {
    checkout: (planSlug: string) =>
      request<{
        simulationMode: boolean;
        success?: boolean;
        checkoutUrl?: string;
        plan?: { name: string; slug: string };
        subscription?: { startDate: string; endDate: string; status: string };
      }>('/payment/checkout', {
        method: 'POST',
        body: JSON.stringify({ planSlug }),
      }),
    cancel: () =>
      request<{ success: boolean; message: string }>('/payment/cancel', {
        method: 'POST',
      }),
    getMode: () =>
      request<{ simulationMode: boolean }>('/payment/mode'),
  },

  reference: {
    jobProfiles: () => request<JobSectorData[]>('/reference/job-profiles'),
    ageRanges: () => request<LabelValue[]>('/reference/age-ranges'),
    professionalStatuses: () => request<LabelValue[]>('/reference/professional-statuses'),
  },

  categories: {
    list: () => request<CategoryData[]>('/categories'),
  },

  packs: {
    list: (params?: { categoryId?: string; type?: PackType; isFree?: boolean }) => {
      const qs = params
        ? '?' + new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)]),
          ).toString()
        : '';
      return request<PackData[]>(`/packs${qs}`);
    },

    get: (id: string) => request<PackWithQuestions>(`/packs/${id}`),

    bySlug: (categorySlug: string, packSlug: string) =>
      request<PackWithQuestions>(`/packs/slug/${categorySlug}/${packSlug}`),

    create: (data: CreatePackPayload) =>
      request<PackData>('/packs', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: UpdatePackPayload) =>
      request<PackData>(`/packs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
      request<{ id: string }>(`/packs/${id}`, { method: 'DELETE' }),

    toggleActive: (id: string) =>
      request<PackData>(`/packs/${id}/toggle-active`, { method: 'POST' }),

    addQuestions: (id: string, questionIds: string[]) =>
      request<PackWithQuestions>(`/packs/${id}/questions`, {
        method: 'POST',
        body: JSON.stringify({ questionIds }),
      }),

    removeQuestion: (id: string, questionId: string) =>
      request<{ success: boolean }>(`/packs/${id}/questions/${questionId}`, {
        method: 'DELETE',
      }),
  },
};
