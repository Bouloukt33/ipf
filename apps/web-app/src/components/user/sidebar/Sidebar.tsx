'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { userNavItems } from './nav-items';
import { useState } from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';

export function UserSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className={`
                hidden md:flex relative flex-col h-screen bg-gray-900 text-white
                transition-all duration-300
                ${collapsed ? 'w-16' : 'w-56'}
            `}>
                {/* Logo */}
                <div className="px-4 py-6">
                    {!collapsed && (
                        <div className="text-orange-400 font-bold text-lg leading-tight">
                            5secondes<br />
                            <span className="text-white">chrono</span>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-1">
                    {userNavItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-colors
                                    ${isActive
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                {!collapsed && <span className="uppercase tracking-wide text-xs">{label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-2 pb-6">
                    <a
                        href="/auth/logout"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors w-full"
                    >
                        <LogOut size={18} />
                        {!collapsed && <span className="uppercase tracking-wide text-xs">Déconnexion</span>}
                    </a>
                </div>

                {/* Collapse button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 bg-gray-700 rounded-full p-1 hover:bg-gray-600"
                >
                    <ChevronLeft size={14} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </aside>

            {/* ── Mobile bottom bar ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center justify-around h-16">
                    {userNavItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                                    flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                                    transition-colors flex-1
                                    ${isActive ? 'text-orange-400' : 'text-gray-500'}
                                `}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] uppercase tracking-wide">{label}</span>
                            </Link>
                        );
                    })}

                    {/* Logout dans la bottom bar aussi */}
                    <a
                        href="/auth/logout"
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                        text-gray-500 hover:text-red-400 transition-colors flex-1"
                    >
                    <LogOut size={20} />
                    <span className="text-[10px] uppercase tracking-wide">Quitter</span>
                </a>
            </div>
        </nav >
        </>
    );
}