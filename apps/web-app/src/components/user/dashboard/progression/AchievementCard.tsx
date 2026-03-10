import { IAchievementCardProps } from "@/lib/type";
import { memo, type ReactNode } from "react";

export const AchievementCard = memo(function AchievementCard({ achievement }: IAchievementCardProps) {
    const pct = achievement.progressMax > 0
        ? Math.round((achievement.progress / achievement.progressMax) * 100)
        : 0;

    return (
        <div
            className={`flex items-center gap-4 border-2 border-[rgba(210,122,45,0.39)] rounded-[14px] p-[18px_22px] bg-white${achievement.locked ? " opacity-40 grayscale" : ""
                }`}
        >
            <div
                className="relative w-[60px] h-[60px] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: achievement.gradient }}
            >
                {achievement.icon}
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
                        className={`succes-bar-fill ${achievement.barColor}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    );
});
