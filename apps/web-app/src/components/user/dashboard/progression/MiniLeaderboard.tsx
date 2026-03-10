import { IMiniLeaderboardProps } from "@/lib/type";
import { memo, useCallback } from "react";

const TriangleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-orange">
        <path d="M7 2l10 10L7 22V2z" />
    </svg>
);

export const MiniLeaderboard = memo(function MiniLeaderboard({
    entries,
    onViewAll,
}: IMiniLeaderboardProps) {
    const handleViewAll = useCallback(onViewAll, [onViewAll]);

    return (
        <div className="border-2 border-[rgba(210,122,45,0.39)] rounded-2xl overflow-hidden bg-white">
            <div className="px-5 py-4 text-[17px] font-black text-charcoal border-b-2 border-[rgba(210,122,45,0.39)] flex items-center justify-between">
                Classement
                <button
                    onClick={handleViewAll}
                    className="text-[13px] font-black text-blue uppercase tracking-[0.5px] cursor-pointer bg-transparent border-none"
                >
                    Voir tout
                </button>
            </div>
            <div>
                {entries.map((entry) => (
                    <div
                        key={entry.rank}
                        className={`flex items-center gap-3 px-5 py-[13px] border-b border-[rgba(210,122,45,0.39)] last:border-b-0 ${entry.isMe ? "bg-[#fef6ee]" : ""
                            }`}
                    >
                        <div className="w-[22px] text-[14px] font-black text-navy flex-shrink-0">{entry.rank}</div>
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black text-white flex-shrink-0"
                            style={{ background: entry.gradient }}
                        >
                            {entry.initial}
                        </div>
                        <div className="flex-1 text-[14px] font-black text-charcoal flex items-center gap-1.5">
                            {entry.name}
                            {entry.isMe && (
                                <span className="bg-orange text-white text-[9px] font-black px-[7px] py-[2px] rounded-lg uppercase">
                                    Toi
                                </span>
                            )}
                        </div>
                        <div className="text-[14px] font-black text-navy flex items-center gap-1">
                            <TriangleIcon />
                            {entry.score}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
