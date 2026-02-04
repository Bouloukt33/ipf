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
        badge: '⭐ POPULAIRE',
        features: [
            'Tout Apprenti +',
            'Vidéos explicatives complètes',
            '3 thématiques vidéo',
            'Explications détaillées'
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
            'Outils avancés'
        ],
        featured: false,
    },
];

export default function Pricing() {
    return (
        <section id="tarifs" className="py-24 px-6 bg-gray-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black text-navy mb-4">
                        Choisissez votre formule
                    </h2>
                    <p className="text-xl text-charcoal/70 font-semibold">
                        Des options adaptées à tous les profils d'apprentissage
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mt-16">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`flex-1 max-w-sm bg-white border-2 rounded-2xl p-8 text-center transition-all duration-500 relative hover:-translate-y-3 hover:shadow-card ${
                                plan.featured ? 'border-primary md:scale-105 shadow-card' : 'border-gray-200 hover:border-primary/50'
                            }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-black shadow-primary">
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

                            <ul className="space-y-4 my-8 text-left">
                                {plan.features.map((feature, featureIndex) => (
                                    <li
                                        key={featureIndex}
                                        className="flex items-start text-charcoal/80 text-sm font-medium"
                                    >
                                        <span className="text-primary font-black mr-3 text-lg">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="btn-shine w-full px-6 py-4 bg-gradient-primary text-white border-none rounded-xl font-bold cursor-pointer transition-all duration-300 mt-6 shadow-primary hover:scale-105 hover:shadow-primary-lg">
                                Commencer
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}