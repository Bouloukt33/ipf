'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const mascots = [
    {
        image: '/mascotte/no_bg/mascotte.png',
        alt: 'Mascotte principale 5 Secondes Chrono',
        gradient: 'from-orange-500/20 via-primary/30 to-orange-600/20',
    },
    {
        image: '/mascotte/no_bg/joyeux.png',
        alt: 'Mascotte joyeuse 5 Secondes Chrono',
        gradient: 'from-emerald-500/20 via-green-400/30 to-teal-500/20',
    },
    {
        image: '/mascotte/no_bg/pedagogue.png',
        alt: 'Mascotte pédagogue 5 Secondes Chrono',
        gradient: 'from-blue-500/20 via-cyan-400/30 to-indigo-500/20',
    },
];

export default function Hero() {
    const [currentMascot, setCurrentMascot] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Timer et changement de mascotte synchronisés dans un seul intervalle
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCurrentMascot((m) => (m + 1) % mascots.length);
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (timeLeft / 5) * circumference;

    return (
        <section id="accueil" className="min-h-screen pt-24 pb-12 px-6 md:px-12 relative overflow-hidden flex items-center bg-gradient-to-br from-[#0F1419] via-[#1A2332] to-[#0F1419]">
            {/* Animated gradient blob */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute w-[800px] h-[800px] rounded-full blur-[120px] top-1/2 right-0 -translate-y-1/2 transition-all duration-1000 bg-gradient-to-br ${mascots[currentMascot].gradient}`} />
            </div>

            <div className="max-w-[1400px] mx-auto w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Content */}
                    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <h1 className="text-[68px] font-black mb-[30px] leading-[1.1] text-white">
                            Maîtrisez l'immobilier
                            <span className="block gradient-text-animate">
                                en 5 secondes chrono
                            </span>
                        </h1>

                        <p className="text-[22px] mb-[45px] leading-[1.6] text-white/85 font-semibold">
                            Transformez votre apprentissage avec une méthode révolutionnaire. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.
                        </p>

                        <div className="flex gap-5 mb-[60px] flex-wrap">
                            <Link
                                href="/auth/login"
                                className="px-[50px] py-[22px] bg-gradient-primary text-white rounded-[50px] font-black transition-opacity duration-200 no-underline text-lg shadow-primary hover:opacity-90"
                            >
                                Commencer gratuitement
                            </Link>
                            <Link
                                href="#fonctionnalites"
                                className="px-[50px] py-[22px] bg-white/10 text-white border-[3px] border-primary/50 rounded-[50px] font-black transition-all duration-200 no-underline text-lg hover:bg-white/15 hover:border-primary/80"
                            >
                                Découvrir
                            </Link>
                        </div>
                    </div>

                    {/* Right - Mascot */}
                    <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95'}`}>
                        <div className="relative w-full aspect-square max-w-[600px] mx-auto">

                            {/* Mascot background effects */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute w-[90%] h-[90%] rounded-full border-2 border-dashed border-primary/20 animate-rotate-slow" />
                                <div className={`absolute w-[85%] h-[85%] rounded-full bg-gradient-to-br ${mascots[currentMascot].gradient} blur-3xl animate-pulse-ring`} />
                            </div>

                            {/* Mascot carousel */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                {mascots.map((mascot, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-700 ${
                                            currentMascot === index
                                                ? 'opacity-100 scale-100 rotate-0'
                                                : 'opacity-0 scale-90 rotate-6'
                                        }`}
                                    >
                                        <Image
                                            src={mascot.image}
                                            alt={mascot.alt}
                                            fill
                                            className="object-contain drop-shadow-[0_20px_80px_rgba(0,0,0,0.5)] animate-bounce-soft"
                                            priority={index === 0}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Floating particles */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 bg-primary/60 rounded-full animate-float-particle"
                                        style={{
                                            top: `${[15, 25, 70, 80, 40, 60][i]}%`,
                                            left: `${[10, 85, 90, 15, 50, 30][i]}%`,
                                            animationDelay: `${i * 0.8}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Navigation dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {mascots.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => { setCurrentMascot(index); setTimeLeft(5); }}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        currentMascot === index
                                            ? 'w-8 bg-primary'
                                            : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                    aria-label={`Mascotte ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
