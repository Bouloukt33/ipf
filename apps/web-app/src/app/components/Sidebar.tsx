'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Logo from './Logo';

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
    const [isExpanded, setIsExpanded] = useState(true);

    const navItems = [
        { 
            href: '/dashboard', 
            label: 'Mon cours',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            )
        },
        { 
            href: '/quiz', 
            label: 'Quiz',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
            )
        },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Sidebar Desktop */}
            <aside 
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#1e3a5f] border-r border-white/10 z-40 transition-all duration-300 ease-in-out ${
                    isExpanded ? 'w-64' : 'w-20'
                }`}
            >
                {/* Header with Toggle */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
                    {isExpanded ? (
                        <>
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <Logo />
                                <span className="text-sm font-black text-[#ff8c42] tracking-tight whitespace-nowrap">
                                    5 SECONDES<br/>CHRONO
                                </span>
                            </Link>
                            
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                aria-label="Réduire le menu"
                            >
                                {/* Panel icon - 3 horizontal lines */}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-3">
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                aria-label="Étendre le menu"
                            >
                                {/* Sidebar icon - vertical panel with lines */}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="7" height="18" rx="1" strokeWidth="2"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6h6M14 12h6M14 18h6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all group relative ${
                                isActive(item.href)
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                            } ${!isExpanded ? 'justify-center' : ''}`}
                            title={!isExpanded ? item.label : ''}
                        >
                            <span className={isActive(item.href) ? 'text-[#ff8c42]' : ''}>
                                {item.icon}
                            </span>
                            <span className={`whitespace-nowrap transition-all duration-300 ${
                                isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                            }`}>
                                {item.label}
                            </span>

                            {/* Tooltip on hover when collapsed */}
                            {!isExpanded && (
                                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Stats */}
                {user && (
                    <div className={`p-4 border-t border-white/10 space-y-3 transition-all duration-300 ${
                        isExpanded ? '' : 'px-2'
                    }`}>
                        <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className={`flex-1 min-w-0 transition-all duration-300 ${
                                isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                            }`}>
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
                            className={`block w-full text-center py-2 text-sm text-white/60 hover:text-white transition-all duration-300 ${
                                isExpanded ? 'opacity-100' : 'opacity-0 h-0 py-0 overflow-hidden'
                            }`}
                        >
                            Déconnexion
                        </a>
                    </div>
                )}

                {/* Settings Icon at Bottom (when collapsed) */}
                {!isExpanded && (
                    <div className="p-4 border-t border-white/10 flex justify-center">
                        <button className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e3a5f] border-t border-white/10 z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => (
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
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Logo />
                        <span className="text-sm font-black text-[#ff8c42]">
                            5 SECONDES CHRONO
                        </span>
                    </Link>
                </div>
            </header>
        </>
    );
}