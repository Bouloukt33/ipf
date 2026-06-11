import Link from 'next/link';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export default function Navbar() {
    return (
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
                <Link href="/" className="text-xl font-black text-navy no-underline">
                    5 Secondes <span className="gradient-text-animate">Chrono</span>
                </Link>

                <ul className="hidden md:flex gap-8 list-none items-center">
                    {[
                        { label: 'Fonctionnalités', href: '#fonctionnalites' },
                        { label: 'Tarifs', href: '#tarifs' },
                        { label: 'Contact', href: '#contact' },
                    ].map((item) => (
                        <li key={item.label}>
                            <Link
                                href={item.href}
                                className="no-underline text-navy/70 font-bold text-sm hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3">
                    <a
                        href={`${APP_URL}/auth/login`}
                        className="hidden md:block text-sm font-bold text-navy/70 hover:text-primary transition-colors no-underline btn-press"
                    >
                        Se connecter
                    </a>
                    <a
                        href={`${APP_URL}/auth/login`}
                        className="px-5 py-2.5 bg-gradient-primary text-white rounded-xl font-black text-sm hover:opacity-90 no-underline btn-press"
                    >
                        Commencer
                    </a>
                </div>
            </div>
        </nav>
    );
}
