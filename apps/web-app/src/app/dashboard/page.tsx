import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

    return (
        <div className="min-h-screen bg-white">
            <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-soft">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <h1 className="text-2xl font-black gradient-text-animate">
                                ⚡ 5 Secondes Chrono
                            </h1>
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-charcoal/70 font-semibold">
                                {user.name || user.email}
                            </span>
                            <a 
                                href="/auth/logout"
                                className="px-4 py-2 bg-gray-100 border border-gray-200 text-navy rounded-lg font-bold text-sm transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
                            >
                                Déconnexion
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-navy">Dashboard</h2>
                    <p className="text-charcoal/70 mt-2 font-semibold">
                        Bienvenue {user.name || user.nickname} ! 👋
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Profil',
                            value: user.email as string,
                            icon: '👤',
                            color: 'from-primary to-primary-light',
                        },
                        {
                            title: 'Status',
                            value: 'Actif',
                            icon: '✅',
                            color: 'from-green-500 to-emerald-400',
                        },
                        {
                            title: 'ID Utilisateur',
                            value: (user.sub as string).substring(0, 20) + '...',
                            icon: '🔑',
                            color: 'from-primary-light to-orange',
                        },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="hover-lift bg-white rounded-2xl border border-gray-100 shadow-soft p-6 transition-all duration-500 hover:shadow-card hover:border-primary/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-charcoal/60">{card.title}</h3>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xl shadow-primary`}>
                                    {card.icon}
                                </div>
                            </div>
                            <p className="text-xl font-bold text-navy truncate">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
                    <h3 className="text-xl font-black text-navy mb-4">Informations de session</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-charcoal/60 font-semibold">Email:</span>
                            <span className="font-bold text-navy">{user.email as string}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-charcoal/60 font-semibold">Nom:</span>
                            <span className="font-bold text-navy">{user.name as string}</span>
                        </div>
                        <div className="flex justify-between py-3">
                            <span className="text-charcoal/60 font-semibold">ID Utilisateur:</span>
                            <span className="font-bold text-navy text-xs">{user.sub as string}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}