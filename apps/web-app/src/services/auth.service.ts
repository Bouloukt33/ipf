import { API_ENDPOINTS } from "@/lib/api.config";
import { apiFetch } from "@/lib/api.fetch";
import { IAuthUser } from "@/lib/type";

export async function syncUserWithBackend(): Promise<IAuthUser | null> {
    try {
        const data = await apiFetch<{ user: IAuthUser; isNewUser: boolean }>(
            API_ENDPOINTS.auth.syncUser,
            { method: 'GET' }
        );
        return data.user ?? null;
    } catch (err) {
        console.error('Sync failed:', err);
        return null;
    }
}