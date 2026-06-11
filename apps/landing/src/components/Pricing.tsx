const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

const plans = [
    {
        name: 'Apprenti',
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
        cta: 'Commencer',
    },
    {
        name: 'Compagnon',
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
        cta: 'Commencer',
    },
    {
        name: 'Réussite',
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
        cta: 'Commencer',
    },
];

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
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-2xl p-8 transition-all duration-200 ${
                                plan.featured
                                    ? 'border-2 border-primary md:scale-105'
                                    : 'border border-gray-100'
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-primary text-white text-xs font-black rounded-full whitespace-nowrap">
                                    {plan.badge}
                                </div>
                            )}

                            <h3 className="text-2xl font-black text-navy mb-1">{plan.name}</h3>
                            <p className="text-sm text-charcoal/50 font-semibold mb-6">{plan.description}</p>

                            <div className="mb-8">
                                <span className="text-5xl font-black gradient-text-animate">{plan.price}€</span>
                                <span className="text-charcoal/50 font-semibold">/mois</span>
                            </div>

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
                                className={`block w-full py-3.5 rounded-xl font-black text-center no-underline transition-opacity hover:opacity-90 btn-press ${
                                    plan.featured
                                        ? 'bg-gradient-primary text-white'
                                        : 'bg-gray-100 text-navy hover:bg-gray-200'
                                }`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
