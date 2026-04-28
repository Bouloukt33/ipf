import { use, useCallback } from "react";
import { themes } from "@/data/themes";

import { ProfileHeader } from "./ProfileHeader";
import { StatCard } from "./StatCard";
import { ThemeProgressRow } from "./ThemeProgressRow";
import { AchievementCard } from "./AchievementCard";
import { StreakCard } from "./StreakCard";
import { MiniLeaderboard } from "./MiniLeaderboard";


import {
    STATS,
    ACHIEVEMENTS,
    LEADERBOARD_ENTRIES,
    WEEK_DAYS,
} from "../../../../data/progressionData";
import { Divider } from "@/components/ui/divider";
import { useAuthStore } from "@/store/auth.store";
import { dashboardService } from "@/services/dashboard.service";

interface IPageProgressionProps {
    onGoLeaderboard: () => void;
}

export function PageProgression({ onGoLeaderboard }: IPageProgressionProps) {
    // stable reference even if parent re-renders
    const handleGoLeaderboard = useCallback(onGoLeaderboard, [onGoLeaderboard]);
    const user = useAuthStore((s) => s.user);    
    const stats = use(dashboardService.getStats());

    return (
        <>
            <ProfileHeader
                initial={user?.profile.displayName.charAt(0) || "U"}
                name={user?.profile.displayName || "Unknown User"}
                level={user?.profile.level || 4}
                subscription={user?.subscription.plan === "PRO" ? "Abonné Compagnon" : "Abonné Gratuit"}
                memberSince={user?.createdAt ? `Membre depuis ${new Date(user.createdAt).toLocaleDateString()}` : "Membre depuis Avril 2026"}
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
                        <a
                            href="#"
                            className="text-[14px] font-black text-blue no-underline uppercase tracking-[0.5px] hover:underline"
                        >
                            Afficher tout
                        </a>
                    </div>

                    <div className="flex flex-col gap-3">
                        {ACHIEVEMENTS.map((achievement, i) => (
                            <AchievementCard key={i} achievement={achievement} />
                        ))}
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="w-[310px] flex-shrink-0 max-[900px]:w-full max-[900px]:mt-6">
                    <StreakCard streak={12} weekDays={WEEK_DAYS} />
                    <MiniLeaderboard
                        entries={LEADERBOARD_ENTRIES}
                        onViewAll={handleGoLeaderboard}
                    />
                </div>
            </div>
        </>
    );
}
