'use client'

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { profileService } from "@/services/profile.service";
import type { IProfileData, IPaymentMethod, IPlan } from "@/lib/type";
import { AccountCard } from "@/components/profile/AccountCard";
import { PaymentCard } from "@/components/profile/PaymentCard";
import { SubscriptionSection } from "@/components/profile/SubscriptionSection";

export default function PageProfil() {
    const isLoading   = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    const [profile,         setProfile]         = useState<IProfileData | null>(null);
    const [payment,         setPayment]         = useState<IPaymentMethod | null>(null);
    const [plans,           setPlans]           = useState<IPlan[]>([]);
    const [currentPlanSlug, setCurrentPlanSlug] = useState<string | null>(null);
    const [fetching,        setFetching]        = useState(false);
    const [error,           setError]           = useState<string | null>(null);
    
    useEffect(() => {
        // Attendre que AuthProvider ait fini
        if (isLoading || !accessToken) return;

        setFetching(true);
        setError(null);

        Promise.all([
            profileService.getProfile(),
            profileService.getPaymentMethod(),
            profileService.getPlans(),
        ])
        .then(([p, pay, pl]) => {
            setProfile(p);
            setPayment(pay);
            setPlans(pl);
            setCurrentPlanSlug(p?.subscription?.plan ?? null);
        })
        .catch((err) => {
            console.error('[PageProfil]', err);
            setError(err?.message ?? 'Erreur chargement');
        })
        .finally(() => setFetching(false));

    }, [isLoading, accessToken]); 

    const handleSave = useCallback(async (data: Partial<IProfileData>) => {
        await profileService.updateProfile(data);
        const updated = await profileService.getProfile();
        setProfile(updated);
        setCurrentPlanSlug(updated?.subscription?.plan ?? null);
    }, []);

    const handleChoosePlan = useCallback(async (slug: string) => {
        await profileService.choosePlan(slug);
        const [pl, p] = await Promise.all([
            profileService.getPlans(),
            profileService.getProfile(),
        ]);
        setPlans(pl);
        setCurrentPlanSlug(p?.subscription?.plan ?? null);
    }, []);

    const handleCancelSubscription = useCallback(async () => {
        await profileService.cancelSubscription();
        const [pl, p] = await Promise.all([
            profileService.getPlans(),
            profileService.getProfile(),
        ]);
        setPlans(pl);
        setCurrentPlanSlug(p?.subscription?.plan ?? null);
    }, []);

    // ── Auth en cours ─────────────
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // ── Données en cours de fetch ─
    if (fetching && !profile) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // ── Erreur ──────
    if (error) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="text-[16px] font-[700] text-red-500 mb-2">
                    Impossible de charger le profil
                </div>
                <div className="text-[13px] text-[#6B7280]">{error}</div>
            </div>
        </div>
    );

    // ── Non connecté 
    if (!accessToken) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-[14px] font-[600] text-[#6B7280]">
                Vous devez être connecté pour accéder à cette page.
            </div>
        </div>
    );

    return (
        <div className="px-8 py-9 max-[720px]:px-4 max-[720px]:py-5">
            <h1 className="text-[26px] font-black text-navy tracking-[-0.3px] mb-7">
                Mon profil
            </h1>

            <div className="grid grid-cols-2 gap-5 mb-5 max-[720px]:grid-cols-1">
                <AccountCard
                    profile={profile}
                    onSave={handleSave}
                />
                <PaymentCard
                    payment={payment}
                />
            </div>

            <SubscriptionSection
                plans={plans}
                currentPlanSlug={currentPlanSlug}
                onChoose={handleChoosePlan}
                onCancel={handleCancelSubscription}
            />
        </div>
    );
}