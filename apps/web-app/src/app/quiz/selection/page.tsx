'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { api, type CategoryData } from '@/lib/api'
import { createLogger } from '@/lib/logger'
import LoginRequired from '@/components/quiz/LoginRequired'

const logger = createLogger({ prefix: 'Selection' })

export default function SelectionPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<CategoryData[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingCategories, setLoadingCategories] = useState(true)

    useEffect(() => {
        api.categories
            .list()
            .then((cats) => {
                // Free users: only show Bail Commercial (non-premium)
                // TODO: check user subscription status for premium access
                setCategories(cats.filter((c) => !c.isPremium))
            })
            .catch((err) => {
                logger.warn('Échec chargement catégories, utilisation du fallback', err.message)
                setCategories([
                    { id: 'default', name: 'Bail Commercial', slug: 'bail-commercial', isPremium: false },
                ])
            })
            .finally(() => setLoadingCategories(false))
    }, [])

    function handleStart() {
        if (selected === null) return
        setLoading(true)
        router.push(`/quiz/play?categoryId=${selected}`)
    }

    

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 animate-fade-in-up opacity-0">

            {/* Header */}
            <div className="text-center mb-14">
                <div className="relative w-48 h-48 mx-auto mb-6 drop-shadow-[0_8px_20px_rgba(210,122,45,0.3)]">
                    <Image src="/mascots/joyeux.png" alt="Mascotte" fill className="object-contain" />
                </div>
                <h1 className="text-4xl font-extrabold text-navy mb-3">
                    Choisis ton <span className="text-primary">type de bail</span>
                </h1>
                <p className="text-lg font-semibold text-charcoal/80">
                    Sélectionne le type de bail que tu souhaites réviser
                </p>
            </div>

            {/* Cards */}
            {loadingCategories ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-navy/60 font-semibold">Chargement des catégories...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {categories.map((cat) => {
                        const isSelected = selected === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelected(cat.id)}
                                className={`
                    relative text-left bg-white border-[3px] rounded-2xl p-8
                    transition-all duration-300 ease-out
                    ${isSelected
                                        ? 'border-primary bg-primary/10 -translate-y-1 shadow-primary'
                                        : 'border-navy hover:border-primary hover:bg-primary/10 hover:-translate-y-1'
                                    }
                  `}
                            >
                                <span className={`
                    absolute top-6 right-6 w-7 h-7 rounded-full border-[3px] transition-all duration-300
                    ${isSelected ? 'border-primary bg-primary shadow-[inset_0_0_0_4px_white]' : 'border-navy'}
                  `} />
                                <p className="text-xl font-extrabold text-navy mb-3 pr-10">{cat.name}</p>
                            </button>
                        )
                    })}

                    {/* Locked premium categories hint */}
                    <div className="relative text-left bg-white/50 border-[3px] border-dashed border-navy/20 rounded-2xl p-8 opacity-50 cursor-not-allowed">
                        <div className="absolute top-6 right-6">
                            <svg className="w-6 h-6 text-navy/30" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-xl font-extrabold text-navy/40 mb-2">+5 catégories</p>
                        <p className="text-sm text-navy/30">Disponible avec l&apos;abonnement Premium</p>
                    </div>
                </div>
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