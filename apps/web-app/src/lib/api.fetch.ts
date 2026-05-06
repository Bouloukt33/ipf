import { API_BASE_URL } from "./api.config";

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const { useAuthStore } = await import('@/store/auth.store');
    const token = useAuthStore.getState().accessToken;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error?.message ?? `API error ${res.status}`);
    }

    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}