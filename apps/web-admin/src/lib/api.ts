import { ENV } from './env';
import { AUTH0_SCOPE } from './auth0';
import type { MetaPayload, QuestionListResponse, QuestionRecord, QuestionStatus } from './types';

const API_BASE = `${ENV.apiBaseUrl.replace(/\/$/, '')}/api`;

export async function getAccessToken(
  getAccessTokenSilently: (options?: any) => Promise<string>,
) {
  return getAccessTokenSilently({
    authorizationParams: {
      audience: ENV.auth0Audience,
      scope: AUTH0_SCOPE,
    },
  });
}

export async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erreur API (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMeta(token: string) {
  return apiFetch<MetaPayload>('/admin/questions/meta', token);
}

export async function fetchQuestions(
  token: string,
  filters: {
    categoryId?: string;
    themeId?: string;
    level?: number;
    status?: QuestionStatus;
    page?: number;
    limit?: number;
  },
) {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.themeId) params.set('themeId', filters.themeId);
  if (filters.level) params.set('level', String(filters.level));
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  return apiFetch<QuestionListResponse>(
    `/admin/questions${query ? `?${query}` : ''}`,
    token,
  );
}

export async function fetchQuestion(token: string, id: string) {
  return apiFetch<QuestionRecord>(`/admin/questions/${id}`, token);
}

export async function createQuestion(
  token: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<QuestionRecord>('/admin/questions', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateQuestion(
  token: string,
  id: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<QuestionRecord>(`/admin/questions/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateQuestionStatus(
  token: string,
  id: string,
  status: QuestionStatus,
) {
  return apiFetch<QuestionRecord>(`/admin/questions/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
