import { memo } from "react";
import type { IPlan } from "@/lib/type";

interface IPlanCardProps {
    plan: IPlan;
    isActive: boolean;
    onChoose: (slug: string) => void;
    onCancel?: () => void;
}

export const PlanCard = memo(function PlanCard({ plan, isActive, onChoose, onCancel }: IPlanCardProps) {
    const priceFormatted = plan.price.toFixed(2).replace(".", ",");

    return (
        <div className={`relative rounded-[16px] p-[24px_20px] border-2 transition-all duration-200 ${
            isActive
                ? "border-navy text-white"
                : "bg-white border-[#E5E7EB] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(23,46,66,0.1)]"
        }`}
            style={isActive ? { background: 'linear-gradient(160deg,#172E42 0%,#1e3d58 100%)' } : {}}
        >
            {/* Badge actuel */}
            {isActive && (
                <div className="inline-block bg-gradient-to-br from-[#D27A2D] to-[#E89347] text-white text-[10px] font-[800] px-3 py-1 rounded-[20px] mb-3 uppercase tracking-[0.5px]">
                    ⭐ Actuel
                </div>
            )}

            {/* Name + save pct */}
            <div className="flex items-center gap-0 mb-1">
                <div className={`text-[20px] font-[900] ${isActive ? "text-white" : "text-navy"}`}>
                    {plan.name}
                </div>
                {plan.savePct && (
                    <span className={`ml-[6px] text-[11px] font-[800] px-2 py-[3px] rounded-[8px] ${
                        isActive
                            ? "bg-[rgba(210,122,45,0.25)] text-[#E89347]"
                            : "bg-[rgba(210,122,45,0.12)] text-[#D27A2D]"
                    }`}>
                        -{plan.savePct}%
                    </span>
                )}
            </div>

            {/* Price */}
            <div className={`text-[30px] font-[900] leading-none flex items-baseline gap-1 ${isActive ? "text-white" : "text-navy"}`}>
                <span className="text-[16px] font-[700]">€</span>
                {priceFormatted}
            </div>

            {/* Period */}
            <div className={`text-[12px] font-[600] mt-1 mb-0 ${isActive ? "text-white/55" : "text-[#6B7280]"}`}>
                par mois
                {plan.yearlyPrice && (
                    <>
                        {" · "}
                        <span className={isActive ? "opacity-50" : "text-[#9CA3AF]"}>
                            {plan.yearlyPrice} €/an
                        </span>
                    </>
                )}
            </div>

            {/* Description */}
            <div className={`text-[12px] font-[600] leading-[1.5] mt-2 mb-4 ${isActive ? "text-white/55" : "text-[#6B7280]"}`}>
                {plan.description}
            </div>

            {/* Next billing */}
            {isActive && plan.nextBilling && (
                <div className="text-[12px] font-[600] text-white/50 mb-4">
                    Prochain prélèvement : {plan.nextBilling}
                </div>
            )}

            {/* CTA */}
            {isActive ? (
                <>
                    <button className="w-full flex items-center justify-center gap-[7px] bg-transparent border-2 border-white/30 text-white/85 text-[13px] font-[800] uppercase tracking-[0.5px] py-[13px] rounded-[14px] hover:bg-white/10 transition-all duration-200 cursor-pointer"
                        style={{ fontFamily: 'Nunito, sans-serif' }}>
                        <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Abonnement actuel
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="block w-full text-center text-[12px] font-[700] text-white/40 mt-[10px] hover:text-white/70 underline transition-colors duration-200 cursor-pointer bg-transparent border-none"
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                            Résilier l&apos;abonnement
                        </button>
                    )}
                </>
            ) : (
                <button
                    onClick={() => onChoose(plan.slug)}
                    className="w-full bg-gradient-to-br from-[#D27A2D] to-[#E89347] text-white text-[13px] font-[800] uppercase tracking-[0.5px] py-[13px] rounded-[14px] border-none shadow-[0_4px_14px_rgba(210,122,45,0.3)] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(210,122,45,0.45)] transition-all duration-200 cursor-pointer"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                    Choisir cette offre
                </button>
            )}
        </div>
    );
});