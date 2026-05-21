import { ILeaderboardRow } from "@/lib/type";
import { TrendBadge } from "./TrendBadge";
import { Score } from "./Score";

export function LeaderboardRow({ row }: { row: ILeaderboardRow }) {
    return (
        <div
            className={`flex items-center gap-3.5 px-5 py-4 rounded-[14px] border-2 bg-white transition-all duration-150 hover:translate-x-1 hover:shadow-soft max-[600px]:px-3.5 max-[600px]:gap-2.5
        ${row.me ? "bg-[#fff8f0] border-orange" : "border-[rgba(210,122,45,0.39)]"}`}
        >
            <div className={`w-7 text-[16px] font-black text-center flex-shrink-0 ${row.hi ? "text-navy" : "text-muted"}`}>
                {row.rk}
            </div>
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-[17px] font-black text-white flex-shrink-0 max-[600px]:w-10 max-[600px]:h-10 max-[600px]:text-[15px]"
                style={{ background: row.bg }}
            >
                {row.initial}
            </div>
            <div className="flex-1">
                <div className="text-[16px] font-black text-charcoal flex items-center gap-2">
                    {row.name}
                    {row.me && (
                        <span className="bg-orange text-white text-[9px] font-black px-[7px] py-[2px] rounded-lg uppercase">
                            Toi
                        </span>
                    )}
                </div>
                <div className="text-[13px] font-extrabold text-muted mt-[1px]">{row.handle}</div>
            </div>
            <TrendBadge trend={row.trend} trendVal={row.trendVal} />
            <Score value={row.score} />
        </div>
    )
}