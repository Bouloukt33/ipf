import { ReactNode } from "react";

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
export type SubscriptionPlan = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";
export type Zone = 'mobile' | 'tablet' | 'desktop';
export type Trend = "up" | "dn" | "eq"
export type DayStatus = "done" | "today" | "none";

export interface IUserProfile {
    displayName: string;
    avatarUrl: string;
    xpTotal: number;
    level: number;
    streakDays: number;
    bestStreak: number;
    lastPlayedAt: string;
}

export interface IUserSubscription {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: string;
}

export interface IAuthUser {
    id: number;
    auth0Id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    profile: IUserProfile;
    subscription: IUserSubscription;
}

export interface IUser {
    id: number;
    auth0Id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    profile: IUserProfile;
    subscription: IUserSubscription;
}
export interface IAuthState {
    user: IUser | null;
    accessToken: string | null;  
    isLoading: boolean;
    setUser: (user: IUser, accessToken: string) => void; 
    clearUser: () => void;
}

export interface ILeaderboardRow {
    rk: string
    hi: boolean
    initial: string
    name: string
    handle: string
    trend: Trend
    trendVal: string
    score: string
    bg: string
    me: boolean
}

export interface IPodiumEntry {
    rank: 1 | 2 | 3
    initial: string
    name: string
    score: string
    bg: string
}

export interface ILeaderboardEntry {
    rank: number;
    initial: string;
    name: string;
    score: string;
    gradient: string;
    isMe?: boolean;
}

export interface IStatItem {
    icon?: ReactNode;
    target: number;
    suffix?: string;
    label: string;
}

export interface IWeekDay {
    label: string;
    status: DayStatus;
}

export interface IThemeItem {
    name: string;
    count: string;
    pct: number;
    stars: number;
    icBg: string;
    icSvg: ReactNode;
    barStyle?: string; 
}

export interface IAchievement {
    icon?: ReactNode;
    conditionType?: string;  
    slug?: string;
    gradient: string;
    levelLabel: string;
    title: string;
    progress: number;
    progressMax: number;
    description: string;
    barColor: string;
    locked?: boolean;
}