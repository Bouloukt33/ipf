'use client';

import { useEffect, useRef, useState } from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

const plans = [
    {
        name: 'Apprenti',
        level: 'Niveaux 1 → 10',
        price: '29',
        description: 'Pour démarrer et tester la méthode',
        features: [
            'Accès illimité aux quiz',
            'Timer 5 secondes',
            'Sélection par type de bail',
            'Suivi de progression',
            'Statistiques basiques',
        ],
        featured: false,
        xpPerQuiz: '50 XP / quiz',
    },
    {
        name: 'Compagnon',
        level: 'Niveaux 1 → 30',
        price: '49',
        badge: 'Le plus populaire',
        description: 'La formule complète pour progresser vite',
        features: [
            'Tout Apprenti inclus',
            'Vidéos explicatives complètes',
            '3 thématiques vidéo',
            'Explications détaillées',
            'Classements hebdomadaires',
        ],
        featured: true,
        xpPerQuiz: '100 XP / quiz',
    },
    {
        name: 'Réussite',
        level: 'Niveaux illimités',
        price: '99',
        description: 'Pour les professionnels exigeants',
        features: [
            'Tout Compagnon inclus',
            'Coach IA personnalisé 24/7',
            'Plan d\'apprentissage sur-mesure',
            'Outils analytiques avancés',
            'Support prioritaire',
        ],
        featured: false,
        xpPerQuiz: '200 XP / quiz',
    },
];

function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`relative bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-3 cursor-default ${
                plan.featured
                    ? 'border-2 border-primary md:scale-105 featured-card'
                    : 'border border-gray-100 hover:border-primary/30'
            }`}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible
                    ? plan.featured ? 'scale(1.05)' : 'translateY(0)'
                    : 'translateY(32px)',
                transition: `opacity 0.55s ease ${index * 120}ms, transform 0.55s ease ${index * 120}ms, border-color 0.2s`,
            }}
        >
            {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-primary text-white text-xs font-black rounded-full whitespace-nowrap badge-pulse">
                    {plan.badge}
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-black text-navy mb-1">{plan.name}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        {plan.level}
                    </span>
                </div>
                <p className="text-sm text-charcoal/50 font-semibold mt-2">{plan.description}</p>
            </div>

            {/* Prix */}
            <div className="mb-6">
                <span className="text-5xl font-black gradient-text-animate">{plan.price}€</span>
                <span className="text-charcoal/50 font-semibold">/mois</span>
            </div>

            {/* XP indicator */}
            <div className="flex items-center gap-2 mb-6 bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary flex-shrink-0">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-black text-primary">{plan.xpPerQuiz}</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-semibold text-charcoal/70">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary flex-shrink-0">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                    </li>
                ))}
            </ul>

            <a
                href={`${APP_URL}/auth/login`}
                className={`block w-full py-3.5 rounded-xl font-black text-center no-underline btn-press ${
                    plan.featured
                        ? 'bg-gradient-primary text-white'
                        : 'bg-gray-100 text-navy hover:bg-gray-200 transition-colors'
                }`}
            >
                Commencer
            </a>
        </div>
    );
}

export default function Pricing() {
    return (
        <section id="tarifs" className="py-24 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-navy mb-4">
                        Choisissez votre formule
                    </h2>
                    <p className="text-lg text-charcoal/60 font-semibold">
                        Sans engagement, résiliable à tout moment
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {plans.map((plan, i) => (
                        <PricingCard key={plan.name} plan={plan} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
