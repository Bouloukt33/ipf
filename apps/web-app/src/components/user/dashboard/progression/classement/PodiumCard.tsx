import { ORDER, PATHS, PODIUM_STYLES } from "@/data/leaderboard"
import { IPodiumEntry } from "@/lib/type"

export function PodiumCard({ entry }: { entry: IPodiumEntry }) {
    const s = PODIUM_STYLES[entry.rank]
    return (
        <div className={`flex flex-col items-center ${ORDER[entry.rank]}`}>
            <div className="relative mb-2.5">
                {entry.rank === 1 && (
                    <div className="absolute -top-[26px] left-1/2 -translate-x-1/2">
                        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px] fill-gold">
                            <path d={PATHS.crown} />
                        </svg>
                    </div>
                )}
                <div
                    className={`${s.avatarSize} flex items-center justify-center font-black text-white shadow-[0_6px_20px_rgba(0,0,0,.18)]`}
                    style={{ background: entry.bg }}
                >
                    {entry.initial}
                </div>
            </div>
            <div className="text-[14px] font-black text-navy text-center max-w-[120px]">{entry.name}</div>
            <div className="text-[14px] font-black text-muted flex items-center gap-1 mt-[3px] mb-3">
                <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-orange"><path d={PATHS.chevron} /></svg>
                {entry.score}
            </div>
            <div
                className={`w-40 flex items-center justify-center text-[40px] font-black ${s.height} max-[600px]:w-[110px] max-[600px]:text-[30px]`}
                style={{ background: s.bar, color: s.numColor, boxShadow: "inset 0 -4px 0 rgba(0,0,0,.07)" }}
            >
                {entry.rank}
            </div>
        </div>
    )
}