export type QuestionStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface Theme {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  themes?: Theme[];
}

export interface Pack {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  categoryId: string;
  category?: Category | null;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  categoryId?: string | null;
  category?: Category | null;
}

export interface QuestionListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuestionRecord {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  level: number;
  timeToRead?: number | null;
  isPremium: boolean;
  isActive: boolean;
  status: QuestionStatus;
  codification?: string | null;
  packId?: string | null;
  videoId?: string | null;
  categoryId: string;
  themeId?: string | null;
  category?: Category | null;
  theme?: Theme | null;
  pack?: Pack | null;
  video?: Video | null;
  updatedAt?: string;
}

export interface QuestionListResponse {
  data: QuestionRecord[];
  meta: QuestionListMeta;
}

export interface MetaPayload {
  categories: Category[];
  packs: Pack[];
  videos: Video[];
}
