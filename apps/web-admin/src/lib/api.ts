import { ENV } from './env';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const API_BASE = ENV.apiBaseUrl.replace(/\/$/, '');
  const API_PREFIX = '/api';

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
