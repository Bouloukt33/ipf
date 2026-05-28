export type PackType = 'STANDARD' | 'VISITEUR' | 'PREMIUM';

export const PACK_TYPE_LABELS: Record<PackType, string> = {
    STANDARD: 'Standard',
    VISITEUR: 'Visiteur',
    PREMIUM: 'Premium',
};

export const PACK_TYPE_STYLES: Record<PackType, string> = {
    STANDARD: 'text-[#172E42] bg-[rgba(30,58,95,0.08)]',
    VISITEUR: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]',
    PREMIUM: 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]',
};

export interface IPackCategory {
    id: string;
    name: string;
    slug: string;
    isPremium: boolean;
}

export interface IPack {
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
    category: IPackCategory;
    _count?: { questions: number };
}

export interface IPackFormData {
    name: string;
    slug: string;
    categoryId: string;
    description: string;
    type: PackType;
    isFree: boolean;
    price: string;
    order: number;
    isActive: boolean;
}

export interface IPackFilters {
    search: string;
    categoryId: string;
    type: PackType | '';
}

export interface IPackStats {
    total: number;
    active: number;
    free: number;
    visiteur: number;
    premium: number;
}
