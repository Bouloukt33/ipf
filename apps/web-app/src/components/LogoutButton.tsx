"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
    return (
        <a
            href="/auth/logout"
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200 flex items-center gap-2"
        >
            <span><LogOut className="w-4 h-4" /></span> Se déconnecter
        </a>
    );
}