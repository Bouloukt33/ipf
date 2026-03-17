import { API_BASE_URL } from "./api.config";

/**
 * Wrapper fetch centralisé — injecte automatiquement le baseUrl,
 * le Content-Type et le token Auth0 si disponible.
 */
export async function apiFetch<T>(
    path: string,
    options: RequestInit & { token?: string } = {}
): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    };

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error?.message ?? `API error ${res.status}`);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}