"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function WelcomeLogin() {
    const router = useRouter();
    const [displayedText, setDisplayedText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [phase, setPhase] = useState<"typing" | "done">("typing");

    const message = "On est contents de te revoir ! Prêt à reprendre là où tu t'es arrêté ?";

    useEffect(() => {
        let index = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (index < message.length) {
                    setDisplayedText(message.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(interval);
                    setPhase("done");
                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 1800);
                }
            }, 45);
            return () => clearInterval(interval);
        }, 800);

        return () => clearTimeout(timeout);
    }, [router]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up text-center px-4">
            {/* Mascot / Illustration */}
            <div className="mb-8 animate-scale-in">
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                    <div className="relative">
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-110 animate-pulse-ring" />
                        {/* Main circle */}
                        <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-navy to-charcoal flex items-center justify-center shadow-card">
                            <span className="text-7xl animate-wiggle">👋</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-primary mb-4 font-nunito">
                De retour parmi nous !
            </h1>

            {/* Typing text */}
            <p className="text-lg md:text-xl font-semibold text-navy max-w-md min-h-[3rem] font-nunito">
                {displayedText}
                <span
                    className={`inline-block w-0.5 h-5 bg-primary ml-1 align-middle transition-opacity duration-100 ${showCursor ? "opacity-100" : "opacity-0"
                        }`}
                />
            </p>

            {/* Redirect indicator */}
            {phase === "done" && (
                <div className="mt-8 flex items-center gap-3 text-sm text-text-muted font-nunito animate-fade-in-up">
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                    <span>Redirection vers le tableau de bord…</span>
                </div>
            )}
        </div>
    );
}