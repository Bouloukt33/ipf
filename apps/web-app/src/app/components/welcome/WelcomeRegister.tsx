"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WelcomeRegisterProps {
    onComplete: () => void;
}

export function WelcomeRegister({ onComplete }: WelcomeRegisterProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [typingDone, setTypingDone] = useState(false);

    const message = "Plus que quelques questions et le quiz commence !";

    useEffect(() => {
        let index = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (index < message.length) {
                    setDisplayedText(message.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(interval);
                    setTypingDone(true);
                    setTimeout(() => {
                        onComplete();
                    }, 1500);
                }
            }, 50);
            return () => clearInterval(interval);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [onComplete]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up text-center px-4">
            {/* Mascot */}
            <div className="mb-8 animate-scale-in">
                <div className="relative w-64 h-64 mx-auto">
                    {/* Fallback illustration if no mascot image */}
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="relative">
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-110 animate-pulse-ring" />
                            {/* Main circle with emoji */}
                            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-primary-lg">
                                <span className="text-7xl animate-bounce-icon">🎉</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-primary mb-4 font-nunito">
                Inscription validée !
            </h1>

            {/* Typing text */}
            <p className="text-lg md:text-xl font-semibold text-navy min-h-[3rem] font-nunito">
                {displayedText}
                <span
                    className={`inline-block w-0.5 h-5 bg-primary ml-1 align-middle transition-opacity duration-100 ${showCursor ? "opacity-100" : "opacity-0"
                        }`}
                />
            </p>

            {/* Decorative dots */}
            <div className="flex gap-2 mt-8">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/30 animate-bounce-soft"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
        </div>
    );
}