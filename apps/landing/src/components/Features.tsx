'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const features = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        title: 'Quiz 5 Secondes',
        description: 'Répondez en moins de 5 secondes. Cette contrainte temporelle stimule la mémorisation à long terme et renforce vos réflexes professionnels.',
        color: 'bg-orange-50 text-primary',
        xp: '+100 XP',
        badge: 'Rapide',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        title: 'Progression Gamifiée',
        description: 'XP, niveaux, badges, classements hebdomadaires. Votre progression est visible, mesurable et addictive — comme dans un jeu vidéo.',
        color: 'bg-blue-50 text-blue-600',
        xp: '+200 XP',
        badge: 'Populaire',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        title: 'Vidéos Explicatives',
        description: 'Pour chaque thème, des vidéos courtes de 2 à 4 minutes par des experts immobilier. Comprenez le fond, pas seulement la surface.',
        color: 'bg-purple-50 text-purple-600',
        xp: '+150 XP',
        badge: 'Expert',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: 'Coach IA Personnalisé',
        description: 'Une intelligence artificielle qui analyse vos lacunes et adapte votre parcours. Votre coach disponible 24h/24.',
        color: 'bg-emerald-50 text-emerald-600',
        xp: '+300 XP',
        badge: 'IA',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
        title: 'Analytics Détaillés',
        description: 'Suivez votre maîtrise par thématique — baux commerciaux, professionnels, mixtes. Des insights précis pour progresser plus vite.',
        color: 'bg-rose-50 text-rose-600',
        xp: '+75 XP',
        badge: 'Stats',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: 'Classements & Défis',
        description: 'Grimpez dans le classement national, défiez vos collègues, rejoignez des équipes. La compétition saine accélère l\'apprentissage.',
        color: 'bg-amber-50 text-amber-600',
        xp: '+500 XP',
        badge: 'Compétition',
    },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="group relative bg-white border border-gray-100 rounded-2xl p-7 hover:border-primary/30 hover:-translate-y-2 cursor-default transition-all duration-200"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms, border-color 0.2s, translate 0.2s`,
            }}
        >
            {/* Badge XP — apparaît au hover */}
            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                {feature.xp}
            </div>

            {/* Icône avec rotation au hover */}
            <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-200`}>
                {feature.icon}
            </div>

            {/* Petit badge catégorie */}
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-charcoal/30 mb-2">
                {feature.badge}
            </span>

            <h3 className="text-xl font-black text-navy mb-3">{feature.title}</h3>
            <p className="text-charcoal/60 text-sm font-medium leading-relaxed">{feature.description}</p>

            {/* Barre de progression décorative */}
            <div className="mt-5 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
                    style={{ width: visible ? `${60 + index * 7}%` : '0%' }}
                />
            </div>
        </div>
    );
}

export default function Features() {
    return (
        <section id="fonctionnalites" className="py-24 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 relative">
                    <div className="absolute -top-10 right-0 md:right-12 w-40 pointer-events-none hidden md:block">
                        <Image
                            src="/mascotte/no_bg/pedagogue.png"
                            alt="Mascotte pédagogue"
                            width={160}
                            height={200}
                            className="object-contain w-full"
                        />
                    </div>
                    <span className="inline-block px-5 py-2 bg-orange-50 text-primary text-sm font-black rounded-full mb-4 border border-orange-100">
                        Fonctionnalités
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-navy leading-tight mb-4">
                        Comme Duolingo,
                        <span className="block gradient-text-animate">mais pour l'immobilier</span>
                    </h2>
                    <p className="text-lg text-charcoal/60 font-semibold max-w-xl mx-auto">
                        Tous les mécanismes d'engagement des meilleures apps de learning, au service de votre expertise professionnelle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <FeatureCard key={feature.title} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
