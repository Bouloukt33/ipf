// Types canoniques partagés — définis dans packages/shared (@ipf/shared),
// ré-exportés ici pour ne pas casser les imports existants.
export type { QuestionStatus, DifficultyLevel } from '@ipf/shared';
import type { QuestionStatus, DifficultyLevel } from '@ipf/shared';

export type LeaseType =
    | 'COM'
    | 'PRO'
    | 'DER'
    | 'FON'
    | 'HAB'
    | 'AGR'
    | 'RUR';

export interface ICategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    iconUrl: string | null;
    color: string;
    order: number;
    isActive: boolean;
    isPremium: boolean;
    createdAt: string;
    updatedAt: string;
};

export interface IQuestion {
    id: string;
    code: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    leaseType: LeaseType;
    categoryId: string;
    categoryName?: string;
    category: ICategory;
    level: DifficultyLevel;
    timeToRead: number;
    packId?: string;
    videoUrl?: string;
    pedagogicalUrl?: string;
    status: QuestionStatus | 'ACTIVE';
    isPremium: boolean;
    explanation?: string;
    successRate?: number;
    avgResponseTime?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IQuestionFormData {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    leaseType: LeaseType;
    categoryId: string;
    difficulty: DifficultyLevel;
    timeToRead: number;
    packId?: string;
    videoUrl?: string;
    pedagogicalUrl?: string;
    status: QuestionStatus;
    isPremium: boolean;
    explanation?: string;
}

export interface IQuestionFilters {
    search: string;
    leaseType: LeaseType | '';
    categoryId: string;
    difficulty: DifficultyLevel | '';
    status: QuestionStatus | '';
}

export interface IQuestionStats {
    total: number;
    active: number;
    suspended: number;
    archived: number;
    premium: number;
}

export const LEASE_TYPE_LABELS: Record<LeaseType, string> = {
    COM: 'Bail Commercial',
    PRO: 'Bail Professionnel',
    DER: 'Bail Dérogatoire',
    FON: 'Fonds de commerce',
    HAB: "Bail d'habitation",
    AGR: 'Bail agricole',
    RUR: 'Bail rural',
};

export { DIFFICULTY_LABELS, STATUS_LABELS } from '@ipf/shared';

export const DIFFICULTY_LEVEL_MAP: Record<DifficultyLevel, string> = {
    1: 'F',
    2: 'M',
    3: 'D',
    4: 'EC',
};