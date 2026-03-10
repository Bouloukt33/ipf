import { PATHS } from "@/data/leaderboard"
import { ILeaderboardRow } from "@/lib/type"

export function TrendBadge({ trend, trendVal }: Pick<ILeaderboardRow, "trend" | "trendVal">) {
    const colorClass =
        trend === "up" ? "text-green" :
            trend === "dn" ? "text-red" :
                "text-muted"

    return (
        <div className={`text-[13px] font-black min-w-[40px] text-right ${colorClass}`}>
            {trend === "up" && <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] inline fill-current"><path d={PATHS.arrowUp} /></svg>}
            {trend === "dn" && <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] inline fill-current"><path d={PATHS.arrowDown} /></svg>}
            {" "}{trendVal}
        </div>
    )
}
