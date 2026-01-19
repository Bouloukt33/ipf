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
        <section id="tarifs" className="py-24 px-6 bg-[#0a0e27]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
                        Choisissez votre formule
                    </h2>
                    <p className="text-xl text-gray-400">
                        Des options adaptées à tous les profils d'apprentissage
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-start gap-6 mt-16">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`flex-1 max-w-sm bg-gradient-to-br from-[#1a1f3a] to-[#0f1224] border-2 rounded-2xl p-8 text-center transition-all duration-300 relative hover:border-[#d27a2d] hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#d27a2d]/20 ${plan.featured ? 'border-[#d27a2d] md:scale-105 shadow-xl shadow-[#d27a2d]/30' : 'border-[#d27a2d]/20'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#d27a2d] to-[#e8924a] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <h3 className="text-3xl font-black mb-6 text-white">
                                {plan.name}
                            </h3>

                            <div className="my-8">
                                <span className="text-6xl font-black bg-gradient-to-r from-[#d27a2d] to-[#e8924a] bg-clip-text text-transparent">
                                    {plan.price}
                                </span>
                                <span className="text-lg text-gray-400 font-semibold">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 my-8 text-left">
                                {plan.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start text-gray-300 text-sm"
                                    >
                                        <span className="text-[#e8924a] font-black mr-3 text-lg">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full px-6 py-4 bg-gradient-to-r from-[#d27a2d] to-[#e8924a] text-white border-none rounded-xl font-bold cursor-pointer transition-all duration-300 mt-6 shadow-lg shadow-[#d27a2d]/30 hover:scale-105 hover:shadow-xl hover:shadow-[#d27a2d]/40">
                                Commencer
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}