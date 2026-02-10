import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Retourne le type renvoyé par ton API : "login" | "register"
async function syncUser(accessToken: string): Promise<"login" | "register" | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        //const data = await res.json();
        // Ton API retourne { type: "login" | "register", ... }
        //return data?.type ?? null;
        return "login"; // statique -> à changer par la suite
    } catch (error) {
        console.error('[Dashboard] Sync user error:', error);
        return null;
    }
}

export default async function DashboardPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // --- Gestion du redirect welcome ---
    // On lit le cookie pour savoir si on a déjà traité ce type de session
    const cookieStore = await cookies();
    const welcomeHandled = cookieStore.get('welcome_handled')?.value;

    if (!welcomeHandled && session.tokenSet.accessToken) {
        const type = await syncUser(session.tokenSet.accessToken);

        if (type === 'register') {
            // Nouvel utilisateur → on envoie vers la page register (welcome + profil)
            redirect('/welcome?type=register');
        } else if (type === 'login') {
            // Utilisateur existant → on envoie vers la page login (juste le "De retour")
            redirect('/welcome?type=login');
        }
    }

    // --- Dashboard normal ---
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
        <div className="min-h-screen bg-white">
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
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}