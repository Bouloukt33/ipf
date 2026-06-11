'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SubscriptionCancelPage() {
    const router = useRouter()

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md animate-fade-in-up">
                <div className="relative w-40 h-40 mx-auto mb-6">
                    <Image src="/mascots/coach.png" alt="Mascotte" fill className="object-contain" />
                </div>
                <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-navy mb-3">
                    Paiement annulé
                </h1>
                <p className="text-charcoal/70 mb-8">
                    Tu as annulé le paiement. Aucun montant n&apos;a été débité.
                    Tu peux reprendre l&apos;abonnement quand tu veux !
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.push('/subscription')}
                        className="px-8 py-4 bg-gradient-primary text-white text-base font-extrabold rounded-2xl hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-primary-lg"
                    >
                        Voir les offres
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-4 bg-navy/5 text-navy text-base font-extrabold rounded-2xl hover:bg-navy/10 transition-all"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </div>
        </main>
    )
}
