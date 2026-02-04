"use client";

export default function LoginButton() {
    return (
        <a
            href="/auth/login"
            className="btn-shine px-8 py-3 bg-gradient-primary text-white rounded-full font-black text-sm transition-all duration-300 shadow-lg shadow-primary/40 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5"
        >
            Se connecter
        </a>
    );
}