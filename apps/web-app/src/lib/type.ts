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

export interface IAuthState {
    user: IAuthUser | null;
    isLoading: boolean;
    setUser: (user: IAuthUser) => void;
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

export interface IMiniLeaderboardProps {
    entries: ILeaderboardEntry[];
    onViewAll: () => void;
}

export interface IPageProgressionProps {
    onGoLeaderboard: () => void;
}

export interface IProfileHeaderProps {
    name: string;
    level: number;
    subscription: string;
    memberSince: string;
    initial: string;
}

export interface IStatItem {
    icon: ReactNode;
    target: number;
    suffix?: string;
    label: string;
}

export interface IStatCardProps {
    stat: IStatItem;
}

export interface IWeekDay {
    label: string;
    status: DayStatus;
}

export interface IStreakCardProps {
    streak: number;
    weekDays: IWeekDay[];
}

export interface IThemeFillProps {
    pct: number;
    barStyle?: string; 
}

export interface IThemeItem {
    name: string;
    count: string;
    pct: number;
    stars: number;
    icBg: string;
    icSvg: ReactNode;
    barStyle?: string; // matches the type coming from @/data/themes
}

export interface IThemeProgressRowProps {
    theme: IThemeItem;
}

export interface IAchievement {
    icon: ReactNode;
    gradient: string;
    levelLabel: string;
    title: string;
    progress: number;
    progressMax: number;
    description: string;
    barColor: string;
    locked?: boolean;
}

export interface IAchievementCardProps {
    achievement: IAchievement;
}
