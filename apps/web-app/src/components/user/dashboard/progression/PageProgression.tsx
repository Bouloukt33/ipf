import { useCallback, useEffect, useState } from "react";

import { ProfileHeader } from "./ProfileHeader";
import { StatCard } from "./StatCard";
import { ThemeProgressRow } from "./ThemeProgressRow";
import { AchievementCard } from "./AchievementCard";
import { StreakCard } from "./StreakCard";
import { MiniLeaderboard } from "./MiniLeaderboard";

import { WEEK_DAYS } from "../../../../data/progressionData";
import { Divider } from "@/components/ui/divider";
import { useAuthStore } from "@/store/auth.store";
import { dashboardService, StreakResponse } from "@/services/dashboard.service";
import { IAchievement, ILeaderboardEntry, IStatItem } from "@/lib/type";

import { FlameWhiteBadge }  from "@/components/ui/badges/FlameWhiteBadge";
import { ArrowRightBadge }  from "@/components/ui/badges/ArrowRightBadge";
import { TrophyIcon }       from "@/components/ui/icons/TrophyIcon";
import type { ReactNode } from "react";

import {
    FileText, Scale, Clock, AlertTriangle,
    ShieldAlert, Share2, BookOpen, Gavel,
    Building2, Key, Landmark, Briefcase,
} from "lucide-react";

// ── Palette thèmes ────────────────────────────────────────────────────────────
const THEME_PALETTES = [
    { icBg: "#FFF3E8", color: "#D27A2D" }, // orange
    { icBg: "#E8F4FF", color: "#1CB0F6" }, // bleu
    { icBg: "#EDFBE8", color: "#58CC02" }, // vert
    { icBg: "#F3E8FF", color: "#CE82FF" }, // violet
    { icBg: "#FFE8E8", color: "#FF4B4B" }, // rouge
    { icBg: "#FFF8E8", color: "#FFC800" }, // jaune
];

const THEME_ICONS = [
    FileText, Scale, Clock, AlertTriangle,
    ShieldAlert, Share2, BookOpen, Gavel,
    Building2, Key, Landmark, Briefcase,
];

function getThemeDecoration(index: number) {
    const palette = THEME_PALETTES[index % THEME_PALETTES.length];
    const Icon = THEME_ICONS[index % THEME_ICONS.length];
    return {
        icBg: palette.icBg,
        icSvg: <Icon size={24} color={palette.color} strokeWidth={2.5} />,
        barStyle: `background:${palette.color}`,
    };
}

// ── Badge icons ───────────────────────────────────────────────────────────────
const BADGE_ICONS: Record<string, ReactNode> = {
    STREAK_DAYS:      <FlameWhiteBadge />,
    CORRECT_STREAK:   <ArrowRightBadge />,
    FAST_ANSWER:      <ArrowRightBadge />,
    TOP_RANK:         <TrophyIcon />,
    WEEKLY_CHAMPION:  <TrophyIcon />,
    FIRST_SESSION:    <FlameWhiteBadge />,
    TOTAL_XP:         <FlameWhiteBadge />,
    TOTAL_QUESTIONS:  <ArrowRightBadge />,
    PERFECT_SESSION:  <TrophyIcon />,
    CATEGORY_MASTERY: <TrophyIcon />,
};

interface IPageProgressionProps {
    onGoLeaderboard: () => void;
}

export function PageProgression({ onGoLeaderboard }: IPageProgressionProps) {
    const handleGoLeaderboard = useCallback(onGoLeaderboard, [onGoLeaderboard]);
    const user = useAuthStore((s) => s.user);
    const [themes, setThemes] = useState<{ name: string; count: string; pct: number; stars: number; icBg: string; icSvg: ReactNode; barStyle?: string }[]>([]);

    const [stats,        setStats]        = useState<IStatItem[]>([]);
    const [achievements, setAchievements] = useState<IAchievement[]>([]);
    const [streak,       setStreak]       = useState<StreakResponse | null>(null);
    const [leaderboard,  setLeaderboard]  = useState<ILeaderboardEntry[]>([]);

    const isLoading   = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (isLoading || !accessToken) return;

        dashboardService.getStats().then(setStats).catch(console.error);
        dashboardService.getStreak().then(setStreak).catch(console.error);

        dashboardService.getLeaderboardPreview().then((raw: any) => {
            const entries = Array.isArray(raw) ? raw : [...(raw.podium ?? []), ...(raw.rows ?? [])];
            setLeaderboard(entries);
        }).catch(console.error);

        dashboardService.getAchievements().then((raw) => {
            const mapped: IAchievement[] = raw.map((a) => ({
                ...a,
                icon: BADGE_ICONS[a.conditionType ?? ""] ?? <TrophyIcon />,
            }));
            setAchievements(mapped);
        }).catch(console.error);

        dashboardService.getThemes().then((raw) => {
            setThemes(raw.map((t, i) => ({
                ...t,
                ...getThemeDecoration(i),
            })));
        }).catch(console.error);

    }, [isLoading, accessToken]);

    return (
        <>
            <ProfileHeader
                initial={user?.profile.displayName?.charAt(0) ?? "U"}
                name={user?.profile.displayName ?? "Unknown User"}
                level={user?.profile.level ?? 1}
                subscription={user?.subscription?.plan === "PRO" ? "Abonné Compagnon" : "Abonné Gratuit"}
                memberSince={
                    user?.createdAt
                        ? `Membre depuis ${new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`
                        : "Membre depuis Avril 2026"
                }
            />

            <div className="flex max-w-[1020px] mx-auto px-6 pb-10 items-start gap-0 max-[900px]:flex-col max-[900px]:px-4">
                {/* ── Left column ── */}
                <div className="flex-1 min-w-0 pr-7 max-[900px]:pr-0 max-[900px]:w-full">
                    <h2 className="text-[22px] font-black text-charcoal mb-4 mt-1">Statistiques</h2>

                    <div className="grid grid-cols-2 gap-3 mb-1">
                        {stats.map((stat, i) => (
                            <StatCard key={i} stat={stat} />
                        ))}
                    </div>

                    <Divider />

                    <h2 className="text-[22px] font-black text-charcoal mb-4 mt-1">
                        Progression par thématique
                    </h2>

                    <div className="flex flex-col gap-3">
                        {themes.map((theme, i) => (
                            <ThemeProgressRow key={i} theme={theme} />
                        ))}
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[22px] font-black text-charcoal">Succès</h2>
                        <a href="#" className="text-[14px] font-black text-blue no-underline uppercase tracking-[0.5px] hover:underline">
                            Afficher tout
                        </a>
                    </div>

                    <div className="flex flex-col gap-3">
                        {achievements.map((achievement, i) => (
                            <AchievementCard key={i} achievement={achievement} />
                        ))}
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="w-[310px] flex-shrink-0 max-[900px]:w-full max-[900px]:mt-6">
                    <StreakCard
                        streak={streak?.currentStreak ?? 0}
                        weekDays={streak?.weekDays ?? WEEK_DAYS}
                    />
                    {/*<MiniLeaderboard
                        entries={leaderboard}
                        onViewAll={handleGoLeaderboard}
                    />*/}
                </div>
            </div>
        </>
    );
}