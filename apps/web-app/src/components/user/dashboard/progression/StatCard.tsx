import { memo, type ReactNode } from "react";
import { CountUp } from "./CountUp";
import { IStatItem } from "@/lib/type";

interface IStatCardProps {
    stat: IStatItem;
}

export const StatCard = memo(function StatCard({ stat }: IStatCardProps) {
    return (
        <div className="border-2 border-[rgba(210,122,45,0.39)] rounded-[14px] p-[18px_20px] flex items-center gap-3.5 bg-white hover:-translate-y-0.5 transition-transform duration-150 max-[600px]:flex-col max-[600px]:items-start max-[600px]:p-3.5">
            <div>{stat.icon}</div>
            <div>
                <div className="text-[28px] font-black text-charcoal leading-none">
                    <CountUp target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-[13px] font-extrabold text-muted mt-[3px]">{stat.label}</div>
            </div>
        </div>
    );
});
