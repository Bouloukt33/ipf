import Link from 'next/link';
import { Star, Check } from 'lucide-react';

const pricingPlans = [
    {
        name: 'Apprenti',
        price: '29€',
        period: '/mois',
        features: [
            'Accès illimité aux quiz',
            'Timer de 5 secondes',
            'Sélection par type de bail',
            'Suivi de progression',
            'Statistiques basiques',
        ],
        featured: false,
    },
    {
        name: 'Compagnon',
        price: '49€',
        period: '/mois',
        badge: 'Populaire',
        features: [
            'Tout Apprenti +',
            'Vidéos explicatives complètes',
            '3 thématiques vidéo',
            'Explications détaillées',
        ],
        featured: true,
    },
    {
        name: 'Réussite',
        price: '99€',
        period: '/mois',
        features: [
            'Tout Compagnon +',
            'Coaching IA personnalisé',
            'Coach virtuel 24/7',
            'Plan sur-mesure',
            'Outils avancés',
        ],
        featured: false,
    },
];

export default function Pricing() {
    return (
        <section id="tarifs" className="py-24 px-6 bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black text-navy mb-4">
                        Choisissez votre formule
                    </h2>
                    <p className="text-xl text-charcoal/70 font-semibold">
                        Des options adaptées à tous les profils d&apos;apprentissage
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mt-16">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`flex-1 max-w-sm bg-white border-2 rounded-2xl p-8 text-center transition-shadow duration-200 relative animate-fade-in-up opacity-0 ${
                                plan.featured
                                    ? 'border-primary md:scale-105 shadow-card'
                                    : 'border-gray-200 hover:shadow-card'
                            }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-primary flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 fill-white" />
                                    {plan.badge}
                                </div>
                            )}

                            <h3 className="text-3xl font-black mb-6 text-navy">
                                {plan.name}
                            </h3>

                            <div className="my-8">
                                <span className="text-6xl font-black gradient-text-animate">
                                    {plan.price}
                                </span>
                                <span className="text-lg text-charcoal/60 font-semibold">{plan.period}</span>
                            </div>

                            <ul className="space-y-3.5 my-8 text-left">
                                {plan.features.map((feature, featureIndex) => (
                                    <li
                                        key={featureIndex}
                                        className="flex items-start gap-2.5 text-charcoal/80 text-sm font-medium"
                                    >
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/auth/login"
                                className="block w-full px-6 py-4 bg-gradient-primary text-white rounded-xl font-bold transition-opacity duration-200 mt-6 shadow-primary hover:opacity-90 no-underline text-center"
                            >
                                Commencer
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
