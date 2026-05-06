import { IAchievement } from "@/lib/type";
import { memo } from "react";
import {
    Flame, Zap, Trophy, Star, Target,
    Award, Crown, Coins, CheckCircle, BookOpen,
} from "lucide-react";

const CONDITION_ICONS: Record<string, { icon: React.ReactNode; }> = {
    FIRST_SESSION:    { icon: <Star      size={26} color="#fff" strokeWidth={2.5} /> },
    STREAK_DAYS:      { icon: <Flame     size={26} color="#fff" strokeWidth={2.5} /> },
    CORRECT_STREAK:   { icon: <Target    size={26} color="#fff" strokeWidth={2.5} /> },
    CATEGORY_MASTERY: { icon: <BookOpen  size={26} color="#fff" strokeWidth={2.5} /> },
    FAST_ANSWER:      { icon: <Zap       size={26} color="#fff" strokeWidth={2.5} /> },
    TOP_RANK:         { icon: <Trophy    size={26} color="#fff" strokeWidth={2.5} /> },
    WEEKLY_CHAMPION:  { icon: <Crown     size={26} color="#fff" strokeWidth={2.5} /> },
    TOTAL_XP:         { icon: <Coins     size={26} color="#fff" strokeWidth={2.5} /> },
    TOTAL_QUESTIONS:  { icon: <CheckCircle size={26} color="#fff" strokeWidth={2.5} /> },
    PERFECT_SESSION:  { icon: <Award     size={26} color="#fff" strokeWidth={2.5} /> },
};

interface IAchievementCardProps {
    achievement: IAchievement;
}

export const AchievementCard = memo(function AchievementCard({ achievement }: IAchievementCardProps) {
    const pct = achievement.progressMax > 0
        ? Math.min(Math.round((achievement.progress / achievement.progressMax) * 100), 100)
        : 0;

    const iconData = CONDITION_ICONS[achievement.conditionType ?? ""];
    const icon = achievement.icon ?? iconData?.icon ?? <Award size={26} color="#fff" strokeWidth={2.5} />;

    return (
        <div className={`flex items-center gap-4 border-2 border-[rgba(210,122,45,0.39)] rounded-[14px] p-[18px_22px] bg-white transition-all duration-150${achievement.locked ? " opacity-40 grayscale" : " hover:translate-x-1 hover:shadow-soft"}`}>
            <div
                className="relative w-[60px] h-[60px] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: achievement.gradient }}
            >
                {icon}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-navy text-white text-[9px] font-black px-1.5 py-[1px] rounded-lg whitespace-nowrap">
                    {achievement.levelLabel}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="text-[16px] font-black text-charcoal">{achievement.title}</div>
                    <div className="text-[14px] font-black text-muted">
                        {achievement.progress}/{achievement.progressMax}
                    </div>
                </div>
                <div className="text-[13px] font-extrabold text-muted mt-1">{achievement.description}</div>
                <div className="h-2 bg-border rounded-[4px] overflow-hidden mt-2.5">
                    <div
                        className="succes-bar-fill"
                        style={{ width: `${pct}%`, background: achievement.barColor }}
                    />
                </div>
            </div>
        </div>
    );
});