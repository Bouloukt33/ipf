"use client";

export default function LogoutButton() {
    return (
        <a
            href="/auth/logout"
            className="button logout w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
            Se déconnecter
        </a>
    );
}