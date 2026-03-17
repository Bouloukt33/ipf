import { API_ENDPOINTS } from "@/lib/api.config";
import { apiFetch } from "@/lib/api.fetch";
import { IAuthUser } from "@/lib/type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Utilisateur de test pour le développement frontend, à remplacer par la vraie réponse du backend
const mockUser: IAuthUser = {  
    id: 1,
    auth0Id: "auth0|123456",
    email: "user@example.com",
    role: "USER",  // maintenant TypeScript sait que c'est UserRole
    isActive: true,
    createdAt: "2026-03-01T10:00:00Z",
    profile: {
        displayName: "John Doe",
        avatarUrl: "https://i.pravatar.cc/150?img=1",
        xpTotal: 1250,
        level: 5,
        streakDays: 3,
        bestStreak: 10,
        lastPlayedAt: "2026-03-05T18:30:00Z",
    },
    subscription: {
        plan: "PRO",
        status: "ACTIVE",
        expiresAt: "2026-12-31T23:59:59Z",
    },
};

export async function syncUserWithBackend(accessToken: string) {
    /*const res = apiFetch<IAuthUser>(API_ENDPOINTS.auth.syncUser, {
        method: 'POST'
    }).catch(err => {
        console.error('Sync failed:', err);
        return null; 
    }); */

    return mockUser;
}