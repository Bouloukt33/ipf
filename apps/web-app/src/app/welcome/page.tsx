"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WelcomeRegister } from "../components/welcome/WelcomeRegister";
import { ProfileForm } from "../components/welcome/ProfileForm";
import { WelcomeLogin } from "../components/welcome/WelcomeLogin";

type WelcomeStep =
    | "welcome-register"  // animation "Inscription validée !"
    | "profile-form"      // les 3 étapes de profil
    | "welcome-login";    // animation "De retour parmi nous !" + redirect auto

export default function WelcomePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get("type"); // "register" | "login"

    // État interne : on commence par l'animation de bienvenue
    const [step, setStep] = useState<WelcomeStep>(
        type === "register" ? "welcome-register" : "welcome-login"
    );

    // Marque le cookie "welcome_handled" pour ne plus redirect depuis le dashboard
    const markWelcomeDone = async () => {
        await fetch("/api/welcome-done", { method: "POST" });
    };

    // Appelé après l'animation du WelcomeRegister → on passe au formulaire de profil
    const handleRegisterWelcomeDone = () => {
        setStep("profile-form");
    };

    // Appelé après que le ProfileForm a terminé → redirect dashboard
    // (géré directement dans ProfileForm via router.push("/dashboard"))
    // On marque juste le cookie avant
    const handleProfileDone = async () => {
        await markWelcomeDone();
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-nunito">
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
                {step === "welcome-register" && (
                    <WelcomeRegister onComplete={handleRegisterWelcomeDone} />
                )}

                {step === "profile-form" && (
                    <ProfileForm onDone={handleProfileDone} />
                )}

                {step === "welcome-login" && (
                    <WelcomeLogin onDone={markWelcomeDone} />
                )}
            </main>
        </div>
    );
}