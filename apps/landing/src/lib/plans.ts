const API_URL =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';

export interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    features: string[];
}

export async function getPlans(): Promise<Plan[]> {
    try {
        const res = await fetch(`${API_URL}/api/subscription/plans`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}
