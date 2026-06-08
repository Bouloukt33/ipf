import type { ReactNode } from "react";
import { IAchievement, ILeaderboardEntry, IStatItem } from "@/lib/type";
import { TargetIcon } from "@/components/ui/icons/TargetIcon";
import { CheckCircleIcon } from "@/components/ui/icons/CheckCircleIcon";
import { ClockIcon } from "@/components/ui/icons/ClockIcon";
import { FlameIcon } from "@/components/ui/icons/FlameIcon";
import { FlameWhiteBadge } from "@/components/ui/badges/FlameWhiteBadge";
import { ArrowRightBadge } from "@/components/ui/badges/ArrowRightBadge";
import { TrophyIcon } from "@/components/ui/icons/TrophyIcon";


export const STATS: IStatItem[] = [
    { icon: <TargetIcon />, target: 87, label: "Quiz réalisés" },
    { icon: <CheckCircleIcon />, target: 68, suffix: "%", label: "Taux de réussite" },
    { icon: <ClockIcon />, target: 3, suffix: "s", label: "Temps moyen de réponse" },
    { icon: <FlameIcon />, target: 12, label: "Jours de série" },
];

export const ACHIEVEMENTS: IAchievement[] = [
    {
        icon: <FlameWhiteBadge />,
        gradient: "linear-gradient(135deg,#ff6b35,#D27A2D)",
        levelLabel: "NIVEAU 4",
        title: "Tout feu tout flamme",
        description: "Réaliser une série de 30 jours",
        progress: 12,
        progressMax: 30,
        barColor: "bg-gold",
    },
    {
        icon: <ArrowRightBadge />,
        gradient: "linear-gradient(135deg,#2980b9,#1cb0f6)",
        levelLabel: "NIVEAU 3",
        title: "Speed King",
        description: "Répondre en moins de 2 secondes",
        progress: 87,
        progressMax: 200,
        barColor: "bg-blue",
    },
    {
        icon: <TrophyIcon />,
        gradient: "linear-gradient(135deg,#ffc800,#f4a800)",
        levelLabel: "VERROUILLÉ",
        title: "Champion",
        description: "Finir 1er au classement mensuel",
        progress: 0,
        progressMax: 1,
        barColor: "bg-gold",
        locked: true,
    },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const LEADERBOARD_ENTRIES: ILeaderboardEntry[] = [
    { rank: 1, initial: "M", name: "Marie D.", score: "2 847", gradient: "linear-gradient(135deg,#D27A2D,#e88c3a)" },
    { rank: 2, initial: "S", name: "Sophie L.", score: "1 924", gradient: "linear-gradient(135deg,#5d7fa0,#3a5f80)" },
    { rank: 3, initial: "J", name: "Jean-P. M.", score: "1 603", gradient: "linear-gradient(135deg,#6a8c72,#4a6c52)" },
    { rank: 7, initial: "T", name: "Toi", score: "1 420", gradient: "linear-gradient(135deg,#D27A2D,#e88c3a)", isMe: true },
];

// ─── Streak week days ─────────────────────────────────────────────────────────

export const WEEK_DAYS = [
    { label: "L", status: "done" as const },
    { label: "M", status: "done" as const },
    { label: "M", status: "done" as const },
    { label: "J", status: "done" as const },
    { label: "V", status: "today" as const },
    { label: "S", status: "none" as const },
    { label: "D", status: "none" as const },
];
