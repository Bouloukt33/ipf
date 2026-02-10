'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    user?: {
        name?: string;
        email?: string;
        points?: number;
        streak?: number;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { 
            href: '/dashboard', 
            label: 'Mon cours',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            )
        },
        { 
            href: '/quiz', 
            label: 'Quiz',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
            )
        },
        /*{ 
            href: '/videos', 
            label: 'Vidéos',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
            )
        },
        { 
            href: '/progression', 
            label: 'Progression',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
            )
        },
        { 
            href: '/boutique', 
            label: 'Boutique',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
            )
        },
        { 
            href: '/profil', 
            label: 'Profil',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            )
        }, */
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#1e3a5f] border-r border-white/10 z-40">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/dashboard" className="block">
                        <span className="text-xl font-black text-[#ff8c42] tracking-tight">
                            5 SECONDES<br/>CHRONO
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                isActive(item.href)
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Stats */}
                {user && (
                    <div className="p-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                    {user.name}
                                </div>
                                <div className="text-xs text-white/60 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <a
                            href="/auth/logout"
                            className="block w-full text-center py-2 text-sm text-white/60 hover:text-white transition-colors"
                        >
                            Déconnexion
                        </a>
                    </div>
                )}
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e3a5f] border-t border-white/10 z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                                isActive(item.href)
                                    ? 'text-[#ff8c42]'
                                    : 'text-white/50 hover:text-white/70'
                            }`}
                        >
                            <div className={`mb-0.5 ${isActive(item.href) ? 'scale-110' : ''} transition-transform`}>
                                {item.icon}
                            </div>
                            <span className="text-xs font-semibold truncate max-w-full px-1">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 bg-[#1e3a5f] border-b border-white/10 z-40">
                <div className="flex justify-between items-center h-16 px-4">
                    <Link href="/dashboard">
                        <span className="text-lg font-black text-[#ff8c42]">
                            5 SECONDES CHRONO
                        </span>
                    </Link>
                </div>
            </header>
        </>
    );
}