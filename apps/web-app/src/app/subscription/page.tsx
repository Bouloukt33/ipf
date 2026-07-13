'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import Image from 'next/image'
import { api } from '@/lib/api'
import { createLogger } from '@/lib/logger'
import LoginRequired from '@/components/quiz/LoginRequired'

const logger = createLogger({ prefix: 'Subscription' })

// Plans data (matching backend seed)
const PLANS = [
    {
        slug: 'apprenti',
        name: 'Apprenti',
        price: 5.99,
        popular: false,
        features: [
            'Accès à toutes les catégories',
            '10 quiz par jour',
            'Statistiques de base',
        ],
    },
    {
        slug: 'compagnon',
        name: 'Compagnon',
        price: 9.99,
        popular: true,
        features: [
            'Accès à toutes les catégories',
            'Quiz illimités',
            'Statistiques avancées',
            'Mode révision',
        ],
    },
    {
        slug: 'reussite',
        name: 'Réussite',
        price: 19.99,
        popular: false,
        features: [
            'Tout Compagnon +',
            'Coaching personnalisé',
            'Accès prioritaire nouveautés',
            'Support prioritaire',
        ],
    },
]

type Step = 'plans' | 'payment' | 'success'

export default function SubscriptionPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useUser()
    
    const [step, setStep] = useState<Step>('plans')
    const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state (controlled for validation display)
    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')

    function handleSelectPlan(plan: typeof PLANS[0]) {
        setSelectedPlan(plan)
        setStep('payment')
        setError(null)
    }

    function formatCardNumber(value: string) {
        const digits = value.replace(/\D/g, '').slice(0, 16)
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    }

    function formatExpiry(value: string) {
        const digits = value.replace(/\D/g, '').slice(0, 4)
        if (digits.length >= 2) {
            return digits.slice(0, 2) + '/' + digits.slice(2)
        }
        return digits
    }

    async function handleSubmitPayment(e: FormEvent) {
        e.preventDefault()
        if (!selectedPlan) return

        setProcessing(true)
        setError(null)

        try {
            const result = await api.payment.checkout(selectedPlan.slug)

            // Mode Stripe réel : rediriger vers Stripe Checkout
            if (!result.simulationMode && result.checkoutUrl) {
                window.location.href = result.checkoutUrl
                return
            }

            // Mode simulation : abonnement activé directement
            setStep('success')
        } catch (err: any) {
            logger.error('Subscription failed', err)
            setError(err.message || 'Erreur lors du paiement. Veuillez réessayer.')
        } finally {
            setProcessing(false)
        }
    }

    function handleSuccess() {
        // Add refresh param to force profile re-fetch on selection page
        router.push('/quiz/selection?refresh=' + Date.now())
    }

    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </main>
        )
    }

    if (!user) {
        return <LoginRequired returnTo="/subscription" />
    }

    // Success screen
    if (step === 'success') {
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
                        Bienvenue chez les Pros ! 🎉
                    </h1>
                    <p className="text-charcoal/70 mb-8">
                        Ton abonnement <span className="font-bold text-primary">{selectedPlan?.name}</span> est maintenant actif.
                        Toutes les catégories sont débloquées !
                    </p>
                    <button
                        onClick={handleSuccess}
                        className="px-10 py-4 bg-gradient-primary text-white text-lg font-extrabold rounded-2xl hover:-translate-y-1 transition-all shadow-lg hover:shadow-primary-lg"
                    >
                        Commencer à réviser →
                    </button>
                </div>
            </main>
        )
    }

    // Payment form
    if (step === 'payment' && selectedPlan) {
        return (
            <main className="min-h-screen py-12 px-4">
                <div className="max-w-lg mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => setStep('plans')}
                        className="flex items-center gap-2 text-navy/60 hover:text-navy font-semibold mb-8 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour aux offres
                    </button>

                    {/* Plan summary */}
                    <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-primary">Offre sélectionnée</p>
                                <p className="text-2xl font-extrabold text-navy">{selectedPlan.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-navy">{selectedPlan.price.toFixed(2)}€</p>
                                <p className="text-sm text-charcoal/60">/mois</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment form */}
                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                        <h2 className="text-2xl font-extrabold text-navy mb-6">Informations de paiement</h2>

                        {/* Bannière mode simulation */}
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                            <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-semibold text-amber-700">
                                <span className="font-black">Mode démonstration</span> — Aucun paiement réel ne sera effectué.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        {/* Card name */}
                        <div>
                            <label htmlFor="cardName" className="block text-sm font-bold text-navy mb-2">
                                Nom sur la carte
                            </label>
                            <input
                                type="text"
                                id="cardName"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required
                                minLength={2}
                                placeholder="Jean Dupont"
                                className="w-full px-4 py-3 border-2 border-navy/20 rounded-xl font-semibold text-navy placeholder:text-navy/30 focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Card number */}
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-bold text-navy mb-2">
                                Numéro de carte
                            </label>
                            <input
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                required
                                pattern="\d{4}\s\d{4}\s\d{4}\s\d{4}"
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-4 py-3 border-2 border-navy/20 rounded-xl font-semibold text-navy placeholder:text-navy/30 focus:border-primary focus:outline-none transition-colors font-mono"
                            />
                        </div>

                        {/* Expiry + CVV row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="expiry" className="block text-sm font-bold text-navy mb-2">
                                    Date d&apos;expiration
                                </label>
                                <input
                                    type="text"
                                    id="expiry"
                                    value={expiry}
                                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                    required
                                    pattern="\d{2}/\d{2}"
                                    placeholder="MM/AA"
                                    className="w-full px-4 py-3 border-2 border-navy/20 rounded-xl font-semibold text-navy placeholder:text-navy/30 focus:border-primary focus:outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label htmlFor="cvv" className="block text-sm font-bold text-navy mb-2">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    id="cvv"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    required
                                    pattern="\d{3,4}"
                                    placeholder="123"
                                    className="w-full px-4 py-3 border-2 border-navy/20 rounded-xl font-semibold text-navy placeholder:text-navy/30 focus:border-primary focus:outline-none transition-colors font-mono"
                                />
                            </div>
                        </div>

                        {/* Security notice */}
                        <div className="flex items-center gap-2 text-sm text-charcoal/60">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Paiement sécurisé - Vos données sont chiffrées</span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-gradient-primary text-white text-lg font-extrabold rounded-2xl hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-primary-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Traitement en cours...
                                </span>
                            ) : (
                                `Payer ${selectedPlan.price.toFixed(2)}€`
                            )}
                        </button>

                        <p className="text-xs text-center text-charcoal/50">
                            En cliquant sur Payer, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
                        </p>
                    </form>
                </div>
            </main>
        )
    }

    // Plans selection
    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <Image src="/mascots/coach.png" alt="Mascotte" fill className="object-contain" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-navy mb-3">
                        Passe au niveau <span className="text-primary">supérieur</span> !
                    </h1>
                    <p className="text-lg text-charcoal/70 max-w-xl mx-auto">
                        Débloque toutes les catégories et deviens un expert de l&apos;immobilier
                    </p>
                </div>

                {/* Plans grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.slug}
                            className={`relative bg-white border-[3px] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                                plan.popular
                                    ? 'border-primary shadow-primary'
                                    : 'border-navy/20 hover:border-primary/50'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-bold rounded-full">
                                    Le plus populaire
                                </div>
                            )}

                            <h3 className="text-2xl font-extrabold text-navy mb-2">{plan.name}</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-navy">{plan.price.toFixed(2)}€</span>
                                <span className="text-charcoal/60">/mois</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-charcoal/80 font-semibold">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-4 font-extrabold rounded-xl transition-all hover:-translate-y-0.5 ${
                                    plan.popular
                                        ? 'bg-gradient-primary text-white shadow-lg hover:shadow-primary-lg'
                                        : 'bg-navy/5 text-navy hover:bg-primary hover:text-white'
                                }`}
                            >
                                Choisir {plan.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Back link */}
                <div className="text-center">
                    <button
                        onClick={() => router.back()}
                        className="text-navy/60 hover:text-navy font-semibold transition-colors"
                    >
                        ← Retour à la sélection
                    </button>
                </div>
            </div>
        </main>
    )
}
