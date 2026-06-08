import { Zap, Gamepad2, Video, Trophy, Bot, BarChart3 } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'Quiz 5 Secondes',
        description: 'Répondez en 5 secondes chrono ! Une méthode intense qui stimule votre réactivité et ancre vos connaissances durablement.',
    },
    {
        icon: Gamepad2,
        title: 'Progression Gamifiée',
        description: 'Débloquez des niveaux, gagnez des badges et suivez votre évolution comme dans un jeu vidéo addictif.',
    },
    {
        icon: Video,
        title: 'Vidéos Explicatives',
        description: 'Comprenez en profondeur avec des vidéos courtes (2-4 min) expliquant chaque concept par des experts.',
    },
    {
        icon: Trophy,
        title: 'Système de Récompenses',
        description: 'Collectionnez des points, des achievements et grimpez dans le classement pour rester motivé !',
    },
    {
        icon: Bot,
        title: 'Coach IA Personnalisé',
        description: 'Une intelligence artificielle qui s\'adapte à votre profil et vous accompagne à chaque étape.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Détaillés',
        description: 'Suivez votre performance par thématique avec des graphiques et insights pour progresser plus vite.',
    },
];

export default function Features() {
    return (
        <section id="fonctionnalites" className="relative py-24 px-6 bg-white overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy rounded-full blur-[150px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block">
                        <span className="px-6 py-3 bg-gradient-primary text-white text-sm font-bold rounded-full shadow-primary">
                            Fonctionnalités
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-navy leading-tight">
                        Une expérience d'apprentissage
                        <span className="block gradient-text-animate">
                            gamifiée
                        </span>
                    </h2>
                    <p className="text-xl text-charcoal/70 max-w-2xl mx-auto font-semibold">
                        Comme Duolingo, mais pour l'immobilier commercial
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-primary/20 transition-all duration-200 animate-fade-in-up opacity-0"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Icon container */}
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                                        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative space-y-3">
                                    <h3 className="text-2xl font-bold text-navy">
                                        {feature.title}
                                    </h3>
                                    <p className="text-charcoal/60 leading-relaxed text-sm font-medium">
                                        {feature.description}
                                    </p>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}