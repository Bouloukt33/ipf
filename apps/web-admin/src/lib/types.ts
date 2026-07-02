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
    themes?: ITheme[];
};

export interface ITheme {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    categoryId: string;
}

export interface IPack {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    isActive: boolean;
    categoryId: string;
    category?: ICategory | null;
    visibility: 'PUBLIC' | 'PRIVATE';
    assignedUserId?: string | null;
    assignedUser?: {
        id: string;
        email: string;
        profile?: { displayName: string | null } | null;
    } | null;
    durationOverride?: number | null;
    targetQuestionCount?: number | null;
    questions?: IQuestion[];
    _count?: { questions: number };
}

export interface IPackFormData {
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
    isActive: boolean;
    visibility: 'PUBLIC' | 'PRIVATE';
    assignedUserId?: string | null;
    durationOverride?: number | null;
    targetQuestionCount?: number | null;
    questionIds?: string[];
}

export interface IVideo {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    categoryId?: string | null;
    category?: ICategory | null;
}

export interface IQuestion {
    id: string;
    codification?: string | null;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    categoryId: string;
    themeId?: string | null;
    packId?: string | null;
    videoId?: string | null;
    level: DifficultyLevel;
    timeToRead?: number | null;
    isPremium: boolean;
    isActive: boolean;
    status: QuestionStatus;
    category?: ICategory | null;
    theme?: ITheme | null;
    pack?: IPack | null;
    video?: IVideo | null;
    updatedAt?: string;
}

export interface IQuestionFormData {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    categoryId: string;
    themeId?: string | null;
    level: number;
    timeToRead: number;
    packId?: string | null;
    videoId?: string | null;
    status: QuestionStatus;
    isPremium: boolean;
    regenerateCodification?: boolean;
}

export interface IQuestionFilters {
    search: string;
    categoryId: string;
    themeId: string;
    level: number | '';
    status: QuestionStatus | '';
}

export interface IQuestionStats {
    total: number;
    active: number;
    suspended: number;
    archived: number;
    premium: number;
}

export { DIFFICULTY_LABELS, STATUS_LABELS } from '@ipf/shared';
