'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
type Auth0User = {
    [key: string]: unknown;
};

const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'Contact', href: '#contact' },
];

export default function MobileMenu({ user }: { user: Auth0User | null }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden relative">
            <button
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                className="p-2 rounded-lg text-navy hover:bg-gray-100 transition-colors"
            >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-card py-2 flex flex-col">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="px-5 py-3 text-navy/80 font-bold text-[15px] hover:text-primary hover:bg-gray-50 transition-colors no-underline"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="mx-4 my-1 border-t border-gray-100" />

                    {user ? (
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="px-5 py-3 text-primary font-bold text-[15px] hover:bg-gray-50 transition-colors no-underline"
                        >
                            Mon espace
                        </Link>
                    ) : (
                        <Link
                            href="/auth/login"
                            onClick={() => setOpen(false)}
                            className="px-5 py-3 text-primary font-bold text-[15px] hover:bg-gray-50 transition-colors no-underline"
                        >
                            Se connecter
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
