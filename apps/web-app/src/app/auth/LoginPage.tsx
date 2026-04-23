"use client";

import { WelcomeLogin } from "../components/welcome/WelcomeLogin";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-nunito">
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex items-center">
                <div className="w-full">
                    <WelcomeLogin />
                </div>
            </main>
        </div>
    );
}