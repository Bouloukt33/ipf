'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { api, type CategoryData } from '@/lib/api'
import { createLogger } from '@/lib/logger'
import LoginRequired from '@/components/quiz/LoginRequired'

const logger = createLogger({ prefix: 'Selection' })

function SelectionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isLoading: authLoading } = useUser()
    const [categories, setCategories] = useState<CategoryData[]>([])
    const [packs, setPacks] = useState<any[]>([])
    const [selected, setSelected] = useState<{ type: 'category' | 'pack', id: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [checkingProfile, setCheckingProfile] = useState(true)
    const [isPremium, setIsPremium] = useState(false)

    // Refresh trigger from subscription page or URL param
    const refreshKey = searchParams.get('refresh')

    // Fetch profile and premium status
    const fetchProfile = useCallback(async () => {
        if (!user) return;
        try {
            const profile = await api.profile.get();
            const subscription = profile.subscription;
            const isActivePremium = Boolean(
                subscription &&
                subscription.status === 'ACTIVE' &&
                new Date(subscription.currentPeriodEnd) > new Date()
            );
            setIsPremium(isActivePremium);
            if (!profile.ageRange || !profile.professionalStatus || !profile.jobProfileId) {
                router.replace('/quiz/onboarding');
            } else {
                setCheckingProfile(false);
            }
        } catch (err: any) {
            logger.warn('Profile fetch failed, redirecting to onboarding', err.message);
            router.replace('/quiz/onboarding');
        }
    }, [user, router]);

    // Check profile on mount and when refreshKey changes (after subscription)
    useEffect(() => {
        if (authLoading || !user) return;
        setCheckingProfile(true);
        fetchProfile();
    }, [authLoading, user, fetchProfile, refreshKey]);

    useEffect(() => {
        setLoadingData(true);
        Promise.all([
            api.categories.list(),
            api.packs.list() 
        ])
            .then(([cats, packsData]) => {
                setCategories(cats)
                setPacks(packsData)
            })
            .catch((err) => {
                logger.warn('Échec chargement données', err.message)
            })
            .finally(() => setLoadingData(false))
    }, [])

    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        )
    }

    if (!user) {
        return <LoginRequired returnTo="/quiz/selection" />
    }

    if (checkingProfile) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        )
    }

    function handleCategoryClick(cat: CategoryData) {
        if (cat.isPremium && !isPremium) {
            router.push('/subscription')
        } else {
            setSelected({ type: 'category', id: cat.id })
        }
    }

    function handlePackClick(pack: any) {
        setSelected({ type: 'pack', id: pack.id })
    }

    function handleStart() {
        if (selected === null) return
        setLoading(true)
        const param = selected.type === 'category' ? `categoryId=${selected.id}` : `packId=${selected.id}`
        router.push(`/quiz/play?${param}`)
    }

    const freeCategories = categories.filter(c => !c.isPremium)
    const premiumCategories = categories.filter(c => c.isPremium)
    const assignedPacks = packs.filter(p => p.visibility === 'PRIVATE')

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 animate-fade-in-up opacity-0">

            {/* Header */}
            <div className="text-center mb-14">
                <div className="relative w-48 h-48 mx-auto mb-6 drop-shadow-[0_8px_20px_rgba(210,122,45,0.3)]">
                    <Image src="/mascots/joyeux.png" alt="Mascotte" fill className="object-contain" />
                </div>
                <h1 className="text-4xl font-extrabold text-navy mb-3">
                    Choisis ton <span className="text-primary">parcours</span>
                </h1>
                <p className="text-lg font-semibold text-charcoal/80">
                    Sélectionne un type de bail ou un pack personnalisé
                </p>
            </div>

            {loadingData ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-navy/60 font-semibold">Chargement...</p>
                </div>
            ) : (
                <>
                    <div className="space-y-12">
                        {/* Assigned Packs (Coaching) */}
                        {assignedPacks.length > 0 && (
                            <section>
                                <h2 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-orange-500 rounded-full" />
                                    Tes parcours de coaching
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assignedPacks.map((pack) => {
                                        const isSelected = selected?.type === 'pack' && selected.id === pack.id
                                        return (
                                            <button
                                                key={pack.id}
                                                onClick={() => handlePackClick(pack)}
                                                className={`
                                                    relative text-left bg-navy border-[3px] rounded-2xl p-8
                                                    transition-all duration-300 ease-out
                                                    ${isSelected
                                                        ? 'border-primary -translate-y-1 shadow-primary'
                                                        : 'border-navy hover:border-primary hover:-translate-y-1'
                                                    }
                                                `}
                                            >
                                                <div className="absolute top-6 right-6">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-black text-white mb-2 pr-10">{pack.name}</p>
                                                <p className="text-xs font-bold text-white/50 uppercase mb-4 tracking-tighter">
                                                    {pack.category?.name || 'Spécial'} • {pack.targetQuestionCount || 'Max'} Questions
                                                </p>
                                                <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-black rounded-full uppercase">
                                                    Sur-mesure
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Standard Categories */}
                        <section>
                            <h2 className="text-sm font-black text-navy/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-8 h-1 bg-navy/20 rounded-full" />
                                Révisions par Type de Bail
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map((cat) => {
                                    const isSelected = selected?.type === 'category' && selected.id === cat.id
                                    const isLocked = cat.isPremium && !isPremium
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`
                                                relative text-left bg-white border-[3px] rounded-2xl p-8
                                                transition-all duration-300 ease-out
                                                ${isSelected
                                                    ? 'border-primary bg-primary/10 -translate-y-1 shadow-primary'
                                                    : isLocked
                                                        ? 'bg-white/50 border-dashed border-navy/20 hover:border-primary/40 hover:bg-primary/5'
                                                        : 'border-navy hover:border-primary hover:bg-primary/10 hover:-translate-y-1'
                                                }
                                            `}
                                        >
                                            {isLocked ? (
                                                <div className="absolute top-6 right-6">
                                                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <span className={`
                                                    absolute top-6 right-6 w-7 h-7 rounded-full border-[3px] transition-all duration-300
                                                    ${isSelected ? 'border-primary bg-primary shadow-[inset_0_0_0_4px_white]' : 'border-navy'}
                                                `} />
                                            )}
                                            <p className={`text-xl font-extrabold mb-3 pr-10 ${isLocked ? 'text-navy/60' : 'text-navy'}`}>
                                                {cat.name}
                                            </p>
                                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${cat.isPremium ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'}`}>
                                                {cat.isPremium ? 'Premium' : 'Gratuit'}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Unlock CTA for free users */}
                    {!isPremium && premiumCategories.length > 0 && (
                        <div className="text-center mt-12 mb-10">
                            <button
                                onClick={() => router.push('/subscription')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-primary"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Débloquer toutes les catégories
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* CTA */}
            <div className="border-t-2 border-navy/10 pt-8 flex justify-center">
                <button
                    onClick={handleStart}
                    disabled={selected === null || loading}
                    className="
                        inline-flex items-center gap-3 px-12 py-5
                        bg-gradient-primary text-white text-xl font-extrabold rounded-2xl
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-primary-lg active:-translate-y-0.5
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
                    "
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Création de la session...
                        </>
                    ) : (
                        <>
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Commencer le Quiz
                        </>
                    )}
                </button>
            </div>

        </main>
    )
}

export default function SelectionPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <SelectionContent />
        </Suspense>
    )
}
