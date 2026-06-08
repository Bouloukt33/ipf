import { NavButton } from "@/components/ui/navbutton"
import { LB_ROWS, PATHS, PODIUM } from "@/data/leaderboard"
import { MONTHS } from "@/data/months"
import { useState } from "react"
import { PodiumCard } from "./PodiumCard"
import { LeaderboardRow } from "./LeaderboardRow"

export function PageLeaderboard() {
    const [mIdx, setMIdx] = useState(1)
    const [mYear, setMYear] = useState(2026)

    const changeMonth = (d: 1 | -1) => {
        setMIdx((prev) => {
            const next = (prev + d + 12) % 12
            if (d === 1 && next === 0) setMYear((y) => y + 1)
            if (d === -1 && next === 11) setMYear((y) => y - 1)
            return next
        })
    }

    return (
        <div className="max-w-[780px] mx-auto px-6 py-9">
            {/* Header */}
            <div className="text-center mb-7">
                <h1 className="text-[32px] font-black text-primary">Classement</h1>
                <p className="text-[16px] font-extrabold text-muted mt-1">Les meilleurs apprenants du mois</p>

                <div className="flex items-center justify-center gap-3.5 mt-4">
                    <NavButton onClick={() => changeMonth(-1)} path={PATHS.arrowLeft} />
                    <div className="text-[17px] font-black text-navy min-w-[150px] text-center">
                        {MONTHS[mIdx]} {mYear}
                    </div>
                    <NavButton onClick={() => changeMonth(1)} path={PATHS.arrowRight} />
                </div>
            </div>

            {/* Podium */}
            <div className="rounded-3xl px-6 pt-9 pb-0 mb-5">
                <div className="flex items-end justify-center gap-3 max-[600px]:gap-1.5">
                    {PODIUM.map((entry) => <PodiumCard key={entry.rank} entry={entry} />)}
                </div>
            </div>

            {/* Full list */}
            <div className="flex flex-col gap-2 mt-2">
                {LB_ROWS.map((row) => <LeaderboardRow key={row.rk} row={row} />)}
            </div>
        </div>
    )
}

