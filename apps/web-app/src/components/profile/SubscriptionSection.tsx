import { memo, useCallback } from "react";
import { PlanCard } from "./PlanCard";
import type { IPlan } from "@/lib/type";

interface ISubscriptionSectionProps {
    plans: IPlan[];
    currentPlanSlug: string | null;
    onChoose?: (slug: string) => void;
    onCancel?: () => void;
}

export const SubscriptionSection = memo(function SubscriptionSection({
    plans, currentPlanSlug, onChoose, onCancel,
}: ISubscriptionSectionProps) {
    const handleChoose = useCallback((slug: string) => onChoose?.(slug), [onChoose]);

    return (
        <div className="bg-white rounded-[18px] shadow-[0_2px_16px_rgba(23,46,66,0.08)] border-[1.5px] border-[rgba(23,46,66,0.06)] p-[28px_24px]">

            {/* Title */}
            <div className="flex items-center gap-2 text-[15px] font-[800] text-navy uppercase tracking-[0.5px] mb-[18px]">
                <svg className="w-[18px] h-[18px] fill-[#D27A2D] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Abonnement
            </div>

            {plans.length === 0 ? (
                <div className="text-center text-[#6B7280] text-[14px] font-[600] py-8">
                    Aucun plan disponible
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.slug}
                            plan={plan}
                            isActive={plan.slug === currentPlanSlug}
                            onChoose={handleChoose}
                            onCancel={plan.slug === currentPlanSlug ? onCancel : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});