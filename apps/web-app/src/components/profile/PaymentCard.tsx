import { memo, useCallback } from "react";
import { Plus } from "lucide-react";
import type { IPaymentMethod } from "@/lib/type";

interface IPaymentCardProps {
    payment: IPaymentMethod | null;
}

export const PaymentCard = memo(function PaymentCard({ payment }: IPaymentCardProps) {
    const handleCopy = useCallback(() => {
        if (payment?.last4) navigator.clipboard.writeText(payment.last4);
    }, [payment]);

    return (
        <div className="bg-white rounded-[18px] shadow-[0_2px_16px_rgba(23,46,66,0.08)] border-[1.5px] border-[rgba(23,46,66,0.06)] p-[28px_24px]">

            {/* Title */}
            <div className="flex items-center gap-2 text-[15px] font-[800] text-navy uppercase tracking-[0.5px] mb-[22px]">
                <svg className="w-[18px] h-[18px] fill-[#D27A2D] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                Moyen de paiement
            </div>

            {payment ? (
                /* ── Credit card ── */
                <div className="relative rounded-[16px] p-[22px_20px] mb-[14px] overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#172E42 0%,#1e3d58 60%,#2a5275 100%)' }}>

                    {/* Decorative circles */}
                    <div className="absolute -top-[40px] -right-[40px] w-[140px] h-[140px] rounded-full bg-[rgba(210,122,45,0.15)] pointer-events-none" />
                    <div className="absolute -bottom-[50px] right-[10px] w-[110px] h-[110px] rounded-full bg-white/5 pointer-events-none" />

                    <div className="relative z-10">
                        {/* Brand + dots */}
                        <div className="flex justify-between items-start">
                            <span className="text-[22px] font-[900] italic tracking-[2px] text-[#E89347]">
                                {payment.brand?.toUpperCase() ?? "VISA"}
                            </span>
                            <button className="bg-transparent border-none text-white/60 text-[18px] cursor-pointer leading-none">
                                ···
                            </button>
                        </div>

                        {/* Card number */}
                        <div className="flex items-center justify-between text-[15px] font-[700] tracking-[2px] text-white my-[14px]">
                            <span>4441 **** **** {payment.last4}</span>
                            <button
                                onClick={handleCopy}
                                className="bg-[rgba(210,122,45,0.25)] border border-[rgba(210,122,45,0.4)] rounded-[6px] px-[10px] py-[4px] text-[11px] font-[800] text-[#E89347] hover:bg-[rgba(210,122,45,0.4)] transition-all duration-200 cursor-pointer"
                                style={{ fontFamily: 'Nunito, sans-serif' }}
                            >
                                copier
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between">
                            <div>
                                <div className="text-[9px] font-[800] tracking-[1px] uppercase text-white/60 mb-[3px]">EXPIRE</div>
                                <div className="text-[13px] font-[700] text-white">{payment.expiry}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-[800] tracking-[1px] uppercase text-white/60 mb-[3px]">TITULAIRE</div>
                                <div className="text-[13px] font-[700] text-white">{payment.holderName}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-[16px] border-2 border-dashed border-[#E5E7EB] p-8 text-center text-[#6B7280] text-[14px] font-[600] mb-[14px]">
                    Aucune carte enregistrée
                </div>
            )}

            {/* Add card button */}
            <button className="flex items-center gap-[10px] w-full bg-[#FFF9F5] border-2 border-dashed border-[rgba(210,122,45,0.35)] rounded-[12px] px-4 py-3 text-[14px] font-[700] text-[#D27A2D] hover:border-[#D27A2D] hover:bg-[#fff4ea] transition-all duration-200 cursor-pointer"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                <svg className="w-[18px] h-[18px] fill-[#D27A2D] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Ajouter une nouvelle carte
            </button>
        </div>
    );
});