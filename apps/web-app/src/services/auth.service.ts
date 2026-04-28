import { API_ENDPOINTS } from "@/lib/api.config";
import { apiFetch } from "@/lib/api.fetch";
import { IAuthUser } from "@/lib/type";


export async function syncUserWithBackend(accessToken: string) {
    return apiFetch<IAuthUser>(API_ENDPOINTS.auth.syncUser, {
        method: 'POST',
        token: accessToken,
    }).catch(err => {
        console.error('Sync failed:', err);
        return null;
    });
}