import { DayStatus, IWeekDay,  } from "@/lib/type";
import { memo } from "react";

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
);

interface IStreakCardProps {
    streak: number;
    weekDays: IWeekDay[];
}

const DAY_CLASSES: Record<DayStatus, string> = {
    done: "bg-orange border-orange",
    today: "bg-gold border-gold",
    none: "border-[rgba(210,122,45,0.39)]",
};

export const StreakCard = memo(function StreakCard({ streak, weekDays }: IStreakCardProps) {
    return (
        <div className="border-2 border-[rgba(210,122,45,0.39)] rounded-2xl overflow-hidden mb-4 bg-white">
            <div className="px-5 py-4 text-[17px] font-black text-charcoal border-b-2 border-[rgba(210,122,45,0.39)]">
                Ma série
            </div>
            <div className="px-5 py-[22px] text-center">
                <div className="text-[54px] font-black text-orange leading-none">{streak}</div>
                <div className="text-[14px] font-black text-muted uppercase tracking-[0.8px] mt-1">
                    Jours d&apos;affilée
                </div>
            </div>
        </div>
    );
});
