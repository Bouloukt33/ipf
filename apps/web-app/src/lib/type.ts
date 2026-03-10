export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type SubscriptionPlan = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";
export type Zone = 'mobile' | 'tablet' | 'desktop';

export interface UserProfile {
    displayName: string;
    avatarUrl: string;
    xpTotal: number;
    level: number;
    streakDays: number;
    bestStreak: number;
    lastPlayedAt: string;
}

export interface UserSubscription {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: string;
}

export interface AuthUser {
    id: number;
    auth0Id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    profile: UserProfile;
    subscription: UserSubscription;
}

export interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    setUser: (user: AuthUser) => void;
    clearUser: () => void;
}

export interface SidebarItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    iconBg: string;
    isActive: boolean;
    collapsed: boolean;
    tooltip: string;
}
