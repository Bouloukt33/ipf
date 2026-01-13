import { getSession, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions/auth';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                YourApp
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {session.user.name}
                            </span>
                            <form action={logout}>
                                <Button variant="outline" type="submit">
                                    Déconnexion
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600 mt-2">
                        Bienvenue {session.user.name} ! 👋
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Profil',
                            value: session.user.email,
                            icon: '👤',
                            color: 'from-blue-500 to-blue-600',
                        },
                        {
                            title: 'Status',
                            value: 'Actif',
                            icon: '✅',
                            color: 'from-green-500 to-green-600',
                        },
                        {
                            title: 'ID Utilisateur',
                            value: session.user.id,
                            icon: '🔑',
                            color: 'from-purple-500 to-purple-600',
                        },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xl`}>
                                    {card.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-bold mb-4">Informations de session</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{session.user.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Nom:</span>
                            <span className="font-medium">{session.user.name}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">ID Utilisateur:</span>
                            <span className="font-medium">{session.user.id}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}