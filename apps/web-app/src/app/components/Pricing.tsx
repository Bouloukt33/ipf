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
      'Explications détaillées',
      'Historique complet',
      'Badges exclusifs',
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
      'Suivi individuel',
      'Accès prioritaire',
    ],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="tarifs" className="py-[100px] px-10 bg-gradient-dark">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-[60px]">
          <h2 className="text-[56px] font-black text-white mb-5">
            Choisissez votre formule
          </h2>
          <p className="text-xl text-white/70 font-semibold">
            Des options adaptées à tous les profils d'apprentissage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-[60px]">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gradient-to-br from-primary/8 to-primary-light/5 backdrop-blur-[10px] border-[3px] border-primary/20 rounded-[30px] p-[50px] text-center transition-all duration-[400ms] relative hover:border-primary hover:-translate-y-[15px] hover:shadow-primary-hover ${
                plan.featured ? 'bg-gradient-to-br from-primary/15 to-primary-light/10 border-primary scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-[30px] py-[10px] rounded-[25px] text-sm font-black shadow-primary">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-4xl font-black mb-5 text-white">
                {plan.name}
              </h3>

              <div className="my-[30px]">
                <span className="text-[64px] font-black bg-gradient-primary bg-clip-text text-transparent leading-none">
                  {plan.price}
                </span>
                <span className="text-xl opacity-70 font-bold">{plan.period}</span>
              </div>

              <ul className="list-none my-10 text-left">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="py-[18px] border-b-2 border-primary/10 text-white/90 text-base font-bold before:content-['✓'] before:text-primary before:font-black before:mr-[15px] before:text-xl"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full px-5 py-5 bg-gradient-primary text-white border-none rounded-[25px] font-black cursor-pointer transition-all duration-300 mt-[25px] text-lg shadow-primary hover:scale-105 hover:shadow-primary-lg">
                Commencer
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}