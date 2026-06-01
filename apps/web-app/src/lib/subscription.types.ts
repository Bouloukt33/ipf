// ── Subscription admin types ───────────────────────────────────────────────────

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING';
export type PlanSlug = 'apprenti' | 'compagnon' | 'reussite';

export const PLAN_LABELS: Record<PlanSlug, string> = {
    apprenti:  'Apprenti',
    compagnon: 'Compagnon',
    reussite:  'Réussite',
};

export const PLAN_COLORS: Record<PlanSlug, { text: string; bg: string }> = {
    apprenti:  { text: 'text-[#5a7a99]', bg: 'bg-[rgba(90,122,153,0.1)]' },
    compagnon: { text: 'text-[#D27A2D]', bg: 'bg-[rgba(210,122,45,0.1)]' },
    reussite:  { text: 'text-[#7C3AED]', bg: 'bg-[rgba(124,58,237,0.1)]' },
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
    ACTIVE:   'Actif',
    PAST_DUE: 'En retard',
    CANCELED: 'Résilié',
    UNPAID:   'Impayé',
    TRIALING: 'Essai',
};

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
    ACTIVE:   'text-[#10B981] bg-[rgba(16,185,129,0.1)]',
    PAST_DUE: 'text-[#F59E0B] bg-[rgba(245,158,11,0.1)]',
    CANCELED: 'text-[#6B7280] bg-[rgba(107,114,128,0.1)]',
    UNPAID:   'text-[#EF4444] bg-[rgba(239,68,68,0.1)]',
    TRIALING: 'text-[#1CB0F6] bg-[rgba(28,176,246,0.1)]',
};

export interface ISubscriptionUser {
    id:       string;
    email:    string;
    isActive: boolean;
    profile: {
        displayName:  string | null;
        avatarUrl:    string | null;
        streakDays:   number;
        level:        number;
        lastPlayedAt: string | null;
    };
    subscription: {
        id:                 string;
        status:             SubscriptionStatus;
        cancelAtPeriodEnd:  boolean;
        currentPeriodStart: string;
        currentPeriodEnd:   string;
        createdAt:          string;
        plan: { slug: PlanSlug; name: string; price: number };
    };
    usage: {
        sessionsPlayed: number;
        totalHours:     number;
    };
}

export interface ISubscriptionFilters {
    search:   string;
    planSlug: PlanSlug | '';
    status:   SubscriptionStatus | '';
}

// ── Prospects ─────────────────────────────────────────────────────────────────

export interface IProspect {
    id:              string;
    email:           string;
    displayName:     string | null;
    avatarUrl:       string | null;
    planName:        string;
    planSlug?:       string;
    streakDays:      number;
    sessions:        number;
    accuracy:        number;
    engagementScore?: number;
}

// ── Plans admin ───────────────────────────────────────────────────────────────

export interface IAdminPlan {
    id:             string;
    slug:           string;
    name:           string;
    description:    string | null;
    price:          string;
    currency:       string;
    intervalMonths: number;
    features:       string | null;
    stripePriceId:  string | null;
    isActive:       boolean;
    order:          number;
    createdAt:      string;
    _count:         { subscriptions: number };
}

// ── Email templates ───────────────────────────────────────────────────────────

export type EmailTemplateId = 'upsell' | 'coaching' | 'welcome' | 'reminder';

export interface IEmailTemplate {
    id:          EmailTemplateId;
    name:        string;
    subject:     string;
    description: string;
}

export interface IEmailTemplatePreview extends IEmailTemplate {
    html: string;
}
