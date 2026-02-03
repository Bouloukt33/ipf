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
    const initials = getInitials(user.name);

    return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b text-sm text-gray-700">
                        Connecté en tant que
                        <div className="font-semibold truncate">{user.name}</div>
                    </div>

                    <div className="py-1">
                        {/* Tu peux ajouter d'autres items ici */}
                        {/* <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            Profil
                        </button> */}

                        <LogoutButton/>
                    </div>
                </div>
            )}
        </div>
    );
}
