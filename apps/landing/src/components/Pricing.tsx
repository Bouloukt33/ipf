'use client';

import { useEffect, useRef, useState } from 'react';
import type { Plan } from '@/lib/plans';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

function formatPrice(price: number): string {
    return Number.isInteger(price) ? String(price) : price.toFixed(2).replace('.', ',');
}

function PricingCard({ plan, index }: { plan: Plan; index: number }) {
    const featured = plan.slug === 'compagnon';
    const isFree = plan.price === 0;
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
                featured
                    ? 'border-2 border-primary md:scale-105 featured-card'
                    : 'border border-gray-100 hover:border-primary/30'
            }`}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible
                    ? featured ? 'scale(1.05)' : 'translateY(0)'
                    : 'translateY(32px)',
                transition: `opacity 0.55s ease ${index * 120}ms, transform 0.55s ease ${index * 120}ms, border-color 0.2s`,
            }}
        >
            {featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-primary text-white text-xs font-black rounded-full whitespace-nowrap badge-pulse">
                    Le plus populaire
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-black text-navy mb-1">{plan.name}</h3>
                {plan.description && (
                    <p className="text-sm text-charcoal/50 font-semibold mt-2">{plan.description}</p>
                )}
            </div>

            {/* Prix */}
            <div className="mb-6">
                {isFree ? (
                    <span className="text-5xl font-black gradient-text-animate">Gratuit</span>
                ) : (
                    <>
                        <span className="text-5xl font-black gradient-text-animate">{formatPrice(plan.price)}€</span>
                        <span className="text-charcoal/50 font-semibold">/mois</span>
                    </>
                )}
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
                className={`block w-full py-3.5 rounded-xl font-black text-center no-underline ${
                    featured
                        ? 'bg-gradient-primary text-white btn-3d-primary'
                        : 'bg-gray-100 text-navy btn-3d-secondary'
                }`}
            >
                Commencer
            </a>
        </div>
    );
}

export default function Pricing({ plans }: { plans: Plan[] }) {
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

                {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {plans.map((plan, i) => (
                            <PricingCard key={plan.slug} plan={plan} index={i} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-charcoal/50 font-semibold">
                        Nos formules seront bientôt disponibles ici.
                    </p>
                )}
            </div>
        </section>
    );
}
