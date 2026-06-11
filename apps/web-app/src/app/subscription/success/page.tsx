'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SubscriptionSuccessPage() {
    const router = useRouter()

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md animate-fade-in-up">
                <div className="relative w-40 h-40 mx-auto mb-6">
                    <Image src="/mascots/bravo.png" alt="Félicitations" fill className="object-contain" />
                </div>
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-navy mb-3">
                    Paiement confirmé ! 🎉
                </h1>
                <p className="text-charcoal/70 mb-8">
                    Ton abonnement est maintenant actif. Toutes les catégories sont débloquées !
                </p>
                <button
                    onClick={() => router.push('/quiz/selection?refresh=' + Date.now())}
                    className="px-10 py-4 bg-gradient-primary text-white text-lg font-extrabold rounded-2xl hover:-translate-y-1 transition-all shadow-lg hover:shadow-primary-lg"
                >
                    Commencer à réviser →
                </button>
            </div>
        </main>
    )
}
