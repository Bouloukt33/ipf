const features = [
  {
    icon: '⚡',
    title: 'Quiz 5 Secondes',
    description: 'Répondez en 5 secondes chrono ! Une méthode intense qui stimule votre réactivité et ancre vos connaissances durablement.',
  },
  {
    icon: '🎮',
    title: 'Progression Gamifiée',
    description: 'Débloquez des niveaux, gagnez des badges et suivez votre évolution comme dans un jeu vidéo addictif.',
  },
  {
    icon: '🎥',
    title: 'Vidéos Explicatives',
    description: 'Comprenez en profondeur avec des vidéos courtes (2-4 min) expliquant chaque concept par des experts.',
  },
  {
    icon: '🏆',
    title: 'Système de Récompenses',
    description: 'Collectionnez des points, des achievements et grimpez dans le classement pour rester motivé !',
  },
  {
    icon: '🤖',
    title: 'Coach IA Personnalisé',
    description: 'Une intelligence artificielle qui s\'adapte à votre profil et vous accompagne à chaque étape.',
  },
  {
    icon: '📊',
    title: 'Analytics Détaillés',
    description: 'Suivez votre performance par thématique avec des graphiques et insights pour progresser plus vite.',
  },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="py-[100px] px-10 bg-gradient-dark-alt">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-[56px] font-black text-white mb-5">
            Une expérience d'apprentissage gamifiée
          </h2>
          <p className="text-xl text-white/70 font-semibold">
            Comme Duolingo, mais pour l'immobilier commercial 🎯
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-gradient-to-br from-primary/10 to-primary-light/5 backdrop-blur-[10px] p-[50px] rounded-[30px] border-[3px] border-primary/20 transition-all duration-[400ms] relative overflow-hidden hover:-translate-y-[15px] hover:scale-[1.02] hover:border-primary hover:shadow-primary-hover"
            >
              <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(210,122,45,0.1)_0%,transparent_70%)] transition-all duration-[600ms] group-hover:top-[-10%] group-hover:right-[-10%]" />
              
              <div className="relative z-[1]">
                <div className="w-[90px] h-[90px] bg-gradient-primary rounded-[20px] flex items-center justify-center text-[40px] mb-[30px] shadow-primary">
                  {feature.icon}
                </div>
                
                <h3 className="text-[28px] text-white mb-5 font-black">
                  {feature.title}
                </h3>
                
                <p className="text-white/80 leading-[1.7] text-base font-semibold">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}