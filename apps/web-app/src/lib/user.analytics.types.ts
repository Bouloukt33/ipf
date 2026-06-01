// ── Enums & labels ────────────────────────────────────────────────────────────

export type AgeRange = 'AGE_18_25' | 'AGE_26_35' | 'AGE_36_45' | 'AGE_46_55' | 'AGE_56_PLUS';
export type ProfessionalStatus = 'SALARIE' | 'INDEPENDANT' | 'MANDATAIRE';

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
    AGE_18_25: '18 – 25 ans',
    AGE_26_35: '26 – 35 ans',
    AGE_36_45: '36 – 45 ans',
    AGE_46_55: '46 – 55 ans',
    AGE_56_PLUS: '56 ans et +',
};

export const PRO_STATUS_LABELS: Record<ProfessionalStatus, string> = {
    SALARIE:     'Salarié',
    INDEPENDANT: 'Indépendant',
    MANDATAIRE:  'Mandataire',
};

// ── Data shapes ───────────────────────────────────────────────────────────────

export interface IUserAnalyticsProfile {
    displayName:        string | null;
    avatarUrl:          string | null;
    ageRange:           AgeRange | null;
    professionalStatus: ProfessionalStatus | null;
    jobProfile:         { name: string; sector: { name: string } } | null;
    xpTotal:            number;
    level:              number;
    streakDays:         number;
    bestStreak:         number;
    lastPlayedAt:       string | null;
}

export interface IUserAnalyticsStats {
    sessionsPlayed:         number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers:    number;
    accuracy:               number;
    totalXpEarned:          number;
    totalDurationMs:        number;
    avgSessionDurationMs?:  number;
}

export interface IUserAnalyticsRanking {
    eloScore:    number;
    globalRank:  number | null;
    weeklyRank?: number | null;
    monthlyRank?: number | null;
}

// List item
export interface IUserAnalytics {
    id:        string;
    email:     string;
    role:      string;
    isActive:  boolean;
    createdAt: string;
    profile:   IUserAnalyticsProfile;
    ranking:   IUserAnalyticsRanking | null;
    stats:     IUserAnalyticsStats;
}

// Detail
export interface IUserAnalyticsSession {
    id:             string;
    mode:           string;
    score:          number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy:       number;
    xpEarned:       number;
    durationMs:     number | null;
    completedAt:    string | null;
    category:       { name: string; slug: string; color: string | null } | null;
}

export interface IUserAnalyticsCategoryBreakdown {
    categoryId:    string | null;
    categoryName:  string;
    color:         string;
    sessionsCount: number;
    accuracy:      number;
}

export interface IUserAnalyticsCalendarDay {
    date:  string;
    count: number;
}

export interface IUserAnalyticsDetail extends IUserAnalytics {
    badges:            { name: string; slug: string; unlockedAt: string }[];
    recentSessions:    IUserAnalyticsSession[];
    categoryBreakdown: IUserAnalyticsCategoryBreakdown[];
    activityCalendar:  IUserAnalyticsCalendarDay[];
}

// Filters
export interface IUserAnalyticsFilters {
    search:             string;
    professionalStatus: ProfessionalStatus | '';
    ageRange:           AgeRange | '';
}

// Dashboard stats
export interface IAdminDashboardStats {
    users:      { total: number; active: number; newThisWeek: number };
    questions:  { total: number };
    sessions:   { total: number; last7Days: number };
    categories: number;
    charts: {
        sessionsByDay:       { date: string; sessions: number }[];
        usersByProStatus:    { status: string; label: string; count: number }[];
        questionsByCategory: { category: string; color: string; count: number }[];
    };
}
