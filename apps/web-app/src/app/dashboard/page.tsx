import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function syncUser(accessToken: string) {
    try {
        await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
    } catch (error) {
        console.error('[Dashboard] Sync user error:', error);
    }
}

export default async function DashboardPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    if (session.tokenSet.accessToken) {
        await syncUser(session.tokenSet.accessToken);
    }

    const user = session.user;

    const userData = {
        name: user.name || 'Utilisateur',
        email: user.email as string,
        points: 1247,
        streak: 7,
        quizCompleted: 45,
        successRate: 87,
        averageTime: 3.2,
    };

    const dailyQuiz = {
        title: 'Bail commercial',
        description: 'Les clauses essentielles du bail commercial',
        theme: 'Baux commerciaux',
    };

    const lastVideo = {
        title: 'Le droit de préemption commercial',
        duration: '3:45',
        progress: 60,
        theme: 'Fonds de commerce',
    };

    const dailyQuests = [
        { 
            label: 'Gagne 10 XP', 
            progress: 0, 
            total: 10,
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
            )
        },
        { 
            label: 'Apprends pendant 5 minutes', 
            progress: 0, 
            total: 5,
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            )
        },
        { 
            label: 'Obtiens 80% dans 3 leçons', 
            progress: 0, 
            total: 3,
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )
        },
    ];

    const themeProgress = [
        { name: 'Baux commerciaux', progress: 85, color: 'bg-blue-500' },
        { name: 'Fonds de commerce', progress: 72, color: 'bg-green-500' },
        { name: 'Droit des sociétés', progress: 45, color: 'bg-purple-500' },
        { name: 'Urbanisme commercial', progress: 30, color: 'bg-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-[#0f1e2e]">
            <Sidebar user={userData} />

            <main className="lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">
                            Bonjour, {userData.name}
                        </h1>
                        <p className="text-white/60">
                            Prêt à apprendre en 5 secondes chrono ?
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left & Center Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quiz du jour */}
                            <div className="bg-gradient-to-br from-[#58cc02] to-[#48b001] rounded-2xl p-8 shadow-lg">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white/80 uppercase mb-2">
                                            Chapitre 1, Unité 1
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                                            {dailyQuiz.title}
                                        </h2>
                                        <p className="text-white/90 mb-4">
                                            {dailyQuiz.description}
                                        </p>
                                        <Link
                                            href="/quiz/today"
                                            className="inline-flex items-center gap-2 bg-white text-[#58cc02] px-8 py-3 rounded-full font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                        >
                                            COMMENCER
                                        </Link>
                                    </div>
                                    
                                    <div className="relative w-32 h-32">
                                        <Image
                                            src="/mascotte/no_bg/go.png"
                                            alt="Mascotte"
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-xs font-semibold text-white/50">Quiz réalisés</div>
                                    </div>
                                    <div className="text-2xl font-black text-white">{userData.quizCompleted}</div>
                                </div>
                                <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-xs font-semibold text-white/50">Taux réussite</div>
                                    </div>
                                    <div className="text-2xl font-black text-white">{userData.successRate}%</div>
                                </div>
                                <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-xs font-semibold text-white/50">Temps moyen</div>
                                    </div>
                                    <div className="text-2xl font-black text-white">{userData.averageTime}s</div>
                                </div>
                            </div>

                            {/* Reprendre la vidéo */}
                            <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-6">
                                <h3 className="text-lg font-black text-white mb-4">
                                    Reprendre la dernière vidéo
                                </h3>
                                <div className="flex gap-4 items-start bg-black/20 rounded-lg p-4">
                                    <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg overflow-hidden">
                                        <Image
                                            src="/mascotte/no_bg/pedagogue.png"
                                            alt="Vidéo"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-blue-400 mb-1">{lastVideo.theme}</div>
                                        <h4 className="text-sm font-bold text-white mb-2 truncate">{lastVideo.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            <span>{lastVideo.duration}</span>
                                            <span>•</span>
                                            <span>{lastVideo.progress}% complété</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                                            <div
                                                className="bg-blue-500 h-1.5 rounded-full"
                                                style={{ width: `${lastVideo.progress}%` }}
                                            ></div>
                                        </div>
                                        <Link
                                            href="/videos/123"
                                            className="inline-block bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs hover:bg-blue-600 transition-colors"
                                        >
                                            Reprendre
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Progression par thématique */}
                            <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-6">
                                <h3 className="text-lg font-black text-white mb-4">
                                    Progression par thématique
                                </h3>
                                <div className="space-y-3">
                                    {themeProgress.map((theme) => (
                                        <div key={theme.name}>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-sm font-semibold text-white/80">{theme.name}</span>
                                                <span className="text-sm font-black text-white">{theme.progress}%</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div
                                                    className={`${theme.color} h-2 rounded-full transition-all`}
                                                    style={{ width: `${theme.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Quêtes du jour */}
                            <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-black text-white">
                                        Quêtes du jour
                                    </h3>
                                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300">
                                        AFFICHER TOUT
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {dailyQuests.map((quest, index) => (
                                        <div key={index} className="bg-black/20 rounded-lg p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-yellow-400">
                                                    {quest.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-white mb-1">
                                                        {quest.label}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-white/10 rounded-full h-2">
                                                            <div
                                                                className="bg-yellow-500 h-2 rounded-full"
                                                                style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-white/60">
                                                            {quest.progress} / {quest.total}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Points */}
                            <div className="bg-[#1e3a5f] rounded-xl border border-white/10 p-6">
                                <h3 className="text-lg font-black text-white mb-4">
                                    Tes points
                                </h3>
                                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <div className="text-sm font-semibold text-yellow-400">Points totaux</div>
                                    </div>
                                    <div className="text-4xl font-black text-[#ff8c42]">{userData.points}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}