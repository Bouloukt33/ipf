'use client'

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { profileService } from "@/services/profile.service";
import type { IProfileData, IPaymentMethod, IPlan } from "@/lib/type";
import { AccountCard } from "@/components/profile/AccountCard";
import { PaymentCard } from "@/components/profile/PaymentCard";
import { SubscriptionSection } from "@/components/profile/SubscriptionSection";

export default function PageProfil() {
    const user = useAuthStore((s) => s.user);
    const [profile,  setProfile]  = useState<IProfileData | null>(null);
    const [payment,  setPayment]  = useState<IPaymentMethod | null>(null);
    const [plans,    setPlans]    = useState<IPlan[]>([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        Promise.all([
            profileService.getProfile(),
            profileService.getPaymentMethod(),
            profileService.getPlans(),
        ]).then(([p, pay, pl]) => {
            setProfile(p);
            setPayment(pay);
            setPlans(pl);

            console.warn({p, pay, pl});
            
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, []);

    const handleSave = useCallback(async (data: Partial<IProfileData>) => {
        await profileService.updateProfile(data);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="px-8 py-9 max-[720px]:px-4 max-[720px]:py-5">
            <h1 className="text-[26px] font-black text-navy tracking-[-0.3px] mb-7">
                Mon profil
            </h1>

            {/* Top grid */}
            <div className="grid grid-cols-2 gap-5 mb-5 max-[720px]:grid-cols-1">
                <AccountCard profile={profile} onSave={handleSave} />
                <PaymentCard payment={payment} />
            </div>

            {/* Bottom */}
            <SubscriptionSection
                plans={plans}
                currentPlanSlug={user?.subscription?.plan ?? null}
            />
        </div>
    );
}