"use client";

import { useState } from "react";
import { WelcomeRegister } from "../components/welcome/WelcomeRegister";
import { ProfileForm } from "../components/welcome/ProfileForm";

export default function RegisterPage() {
    const [showProfile, setShowProfile] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col font-nunito">
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
                {!showProfile ? (
                    <WelcomeRegister onComplete={() => setShowProfile(true)} />
                ) : (
                    <ProfileForm />
                )}
            </main>
        </div>
    );
}