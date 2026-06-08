import { IAuthUser } from "@/lib/type";

export async function syncUserWithBackend(accessToken: string): Promise<IAuthUser | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}