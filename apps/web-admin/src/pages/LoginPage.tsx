import { useAuth0 } from '@auth0/auth0-react';
import { ListChecks, Users, BarChart3, Lock } from 'lucide-react';

const FEATURES = [
    {
        icon: ListChecks,
        title: 'Questions & quiz',
        text: 'Créez, importez par CSV et organisez la banque de questions.',
    },
    {
        icon: Users,
        title: 'Utilisateurs & abonnements',
        text: 'Gérez les comptes, les plans tarifaires et les accès premium.',
    },
    {
        icon: BarChart3,
        title: 'Statistiques',
        text: "Suivez l'activité, la progression et l'engagement des apprenants.",
    },
];

export function LoginPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <main className="min-h-screen bg-cream font-nunito flex flex-col lg:flex-row">
            {/* ── Panneau marque ── */}
            <section
                aria-label="Présentation du back-office"
                className="lg:w-1/2 bg-gradient-hero text-white relative overflow-hidden
                  flex flex-col justify-center gap-10 px-8 py-12 lg:px-16 lg:py-0"
            >
                {/* Décor statique (pas d'animation en boucle hors chargement) */}
                <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div aria-hidden className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

                <div className="relative motion-safe:animate-fade-in-left">
                    <img
                        src="/images/logo_admin_dark.png"
                        alt="5 Secondes Chrono by Le Carré Pro"
                        className="h-14 object-contain object-left mb-8"
                    />
                    <h2 className="text-[26px] lg:text-[32px] font-black leading-tight mb-3">
                        Le back-office de<br />5 Secondes Chrono
                    </h2>
                    <p className="text-[15px] font-semibold text-white/60 max-w-md">
                        Pilotez le quiz immobilier gamifié du Carré PRO : contenu, joueurs et
                        performance, au même endroit.
                    </p>
                </div>

                <ul className="relative hidden lg:flex flex-col gap-6 motion-safe:animate-fade-in-up">
                    {FEATURES.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="flex items-start gap-4">
                            <span
                                aria-hidden
                                className="flex items-center justify-center w-11 h-11 rounded-2xl
                                  bg-primary/15 border border-primary/25 flex-shrink-0"
                            >
                                <Icon size={20} className="text-primary-light" />
                            </span>
                            <div>
                                <p className="text-[15px] font-extrabold">{title}</p>
                                <p className="text-[13px] font-semibold text-white/55">{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ── Panneau connexion ── */}
            <section className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div
                    className="w-full max-w-md bg-white rounded-[32px] shadow-card border border-ink-100
                      p-8 sm:p-10 text-center motion-safe:animate-fade-in-up"
                >
                    <img
                        src="/images/logo_admin.png"
                        alt=""
                        aria-hidden
                        className="h-12 mx-auto mb-8 object-contain"
                    />
                    <h1 className="text-[28px] font-black text-text-primary mb-2">Administration</h1>
                    <p className="text-[15px] font-semibold text-text-muted mb-9">
                        Connectez-vous pour accéder au tableau de bord.
                    </p>

                    <button
                        onClick={() => loginWithRedirect()}
                        className="w-full h-[52px] rounded-2xl border-none bg-gradient-primary
                          font-extrabold text-[16px] text-white cursor-pointer shadow-primary
                          transition-transform motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]
                          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                          focus-visible:outline-primary"
                    >
                        Se connecter
                    </button>

                    <p className="mt-7 flex items-center justify-center gap-2 text-[12px] font-bold text-text-muted">
                        <Lock size={13} aria-hidden />
                        Connexion sécurisée via Auth0 — accès réservé aux administrateurs.
                    </p>
                </div>
            </section>
        </main>
    );
}
