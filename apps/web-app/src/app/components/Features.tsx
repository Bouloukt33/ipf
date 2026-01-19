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
        <section id="fonctionnalites" className="relative py-24 px-6 bg-[#0a0e27] overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d27a2d] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#e8924a] rounded-full blur-[120px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block">
                        <span className="px-4 py-2 bg-gradient-to-r from-[#d27a2d] to-[#e8924a] text-white text-sm font-bold rounded-full shadow-lg">
                            Fonctionnalités
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                        Une expérience d'apprentissage
                        <span className="block bg-gradient-to-r from-[#d27a2d] to-[#e8924a] bg-clip-text text-transparent">
                            gamifiée
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
                                className="group relative bg-gradient-to-br from-[#1a1f3a] to-[#0f1224] p-8 rounded-2xl border border-[#d27a2d]/20 hover:border-[#d27a2d] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#d27a2d]/20"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#d27a2d]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Icon container */}
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#d27a2d] to-[#e8924a] rounded-xl flex items-center justify-center shadow-lg shadow-[#d27a2d]/30 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                                    </div>
                                    {/* Decorative circle */}
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#e8924a] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                                </div>

                                {/* Content */}
                                <div className="relative space-y-3">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-[#e8924a] transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Bottom accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d27a2d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}