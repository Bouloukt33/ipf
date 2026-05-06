"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WelcomeRegister } from "../components/welcome/WelcomeRegister";
import { ProfileForm } from "../components/welcome/ProfileForm";
import { WelcomeLogin } from "../components/welcome/WelcomeLogin";

type WelcomeStep =
    | "welcome-register"
    | "profile-form"
    | "welcome-login";

function WelcomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get("type");

    const [step, setStep] = useState<WelcomeStep>(
        type === "register" ? "welcome-register" : "welcome-login"
    );

    const markWelcomeDone = async () => {
        await fetch("/api/welcome-done", { method: "POST" });
    };

    const handleRegisterWelcomeDone = () => {
        setStep("profile-form");
    };

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

export default function WelcomePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <WelcomeContent />
        </Suspense>
    );
}