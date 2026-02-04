'use client'

import { useState, useRef, useEffect } from "react";
import LogoutButton from "./LogoutButton";

type User = {
    name: string;
};

function getInitials(name: string) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
        return parts[0][0]?.toUpperCase() ?? "";
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserAvatar({ user }: { user: any }) {
    const initials = getInitials(user.name || user.email || 'U');

    return (
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-primary transition-all duration-300 hover:scale-110">
            {initials}
        </div>
    );
}

export function UserMenu({ user }: { user: any }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Fermer le menu quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            {/* Bouton avatar */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 focus:outline-none"
            >
                <UserAvatar user={user} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white backdrop-blur-lg rounded-xl shadow-card border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                    <div className="px-4 py-4 border-b border-gray-100 text-sm text-charcoal/70">
                        Connecté en tant que
                        <div className="font-bold text-navy truncate mt-1">{user.name || user.email}</div>
                    </div>

                    <div className="py-2">
                        <a 
                            href="/dashboard" 
                            className="w-full text-left px-4 py-2 text-sm text-charcoal/80 hover:bg-gray-100 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                        >
                            <span>📊</span> Dashboard
                        </a>
                        <LogoutButton/>
                    </div>
                </div>
            )}
        </div>
    );
}
