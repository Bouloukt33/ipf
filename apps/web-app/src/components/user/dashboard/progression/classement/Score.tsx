import { PATHS } from "@/data/leaderboard";

export function Score({ value }: { value: string }) {
    return (
        <div className="text-[17px] font-black text-navy flex items-center gap-[5px]">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-orange">
                <path d={PATHS.chevron} />
            </svg>
            {value}
        </div>
    )
}
