'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Hero() {
    const [timeLeft, setTimeLeft] = useState(5);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev <= 0 ? 5 : prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `0${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <section id="accueil" className="min-h-screen pt-[140px] pb-20 px-10 relative overflow-hidden flex items-center bg-gradient-to-br from-navy via-navy to-charcoal">
            {/* Animated Background - reste sombre pour le Hero */}
            <div className="absolute w-full h-full top-0 left-0 overflow-hidden">
                <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 bg-primary blur-3xl top-[5%] right-[5%] animate-float-around" />
                <div className="absolute w-[300px] h-[300px] rounded-full opacity-15 bg-primary-light blur-3xl bottom-[10%] left-[10%] animate-float-around [animation-delay:3s]" />
            </div>

            <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-20 items-center relative z-[1]">
                {/* Content */}
                <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                    <h1 className="text-[68px] font-black mb-[30px] leading-[1.1] text-white">
                        Maîtrisez l'immobilier
                        <span className="block gradient-text-animate">
                            en 5 secondes chrono ⚡
                        </span>
                    </h1>

                    <p className="text-[22px] mb-[45px] leading-[1.6] text-white/85 font-semibold">
                        Transformez votre apprentissage avec une méthode révolutionnaire. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.
                    </p>

                    <div className="flex gap-5 mb-[60px] flex-wrap">
                        <Link
                            href="/auth/login"
                            className="btn-shine px-[50px] py-[22px] bg-gradient-primary text-white border-none rounded-[50px] font-black cursor-pointer transition-all duration-300 no-underline text-lg shadow-primary hover:-translate-y-[5px] hover:scale-105 hover:shadow-primary-lg animate-glow-pulse"
                        >
                            Commencer gratuitement
                        </Link>
                        <Link
                            href="#fonctionnalites"
                            className="px-[50px] py-[22px] bg-white/10 text-white border-[3px] border-primary/50 rounded-[50px] font-black cursor-pointer transition-all duration-300 no-underline text-lg hover:bg-primary/20 hover:border-primary hover:-translate-y-[3px]"
                        >
                            Découvrir
                        </Link>
                    </div>

                    <div className="flex gap-[50px] flex-wrap">
                        {[
                            { number: '50+', label: 'Questions', delay: 0 },
                            { number: '5min', label: 'Par jour', delay: 0.1 },
                            { number: '100%', label: 'Efficace', delay: 0.2 },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className={`hover-lift bg-gradient-to-br from-navy/80 to-charcoal/80 backdrop-blur-[10px] border-2 border-primary/40 rounded-[20px] px-[30px] py-5 text-center transition-all duration-500 hover:border-primary ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                                style={{ transitionDelay: `${stat.delay + 0.5}s` }}
                            >
                                <span className="text-5xl font-black gradient-text-animate block">
                                    {stat.number}
                                </span>
                                <span className="text-sm text-white/80 font-bold mt-[5px] block">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timer */}
                <div className={`flex justify-center items-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-90'}`}>
                    <div className="relative w-[450px] h-[450px] flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary-light/20 border-[8px] border-primary/50 animate-pulse-ring animate-rotate-slow" />
                        <div className="absolute w-[420px] h-[420px] rounded-full border-2 border-dashed border-primary/30 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />

                        <div className="relative w-[350px] h-[350px] bg-gradient-to-br from-navy/95 to-charcoal/95 backdrop-blur-[20px] rounded-full flex flex-col items-center justify-center border-[6px] border-primary/60 shadow-[0_30px_80px_rgba(210,122,45,0.4),inset_0_0_50px_rgba(210,122,45,0.15)] pulse-glow">
                            <div className="text-[120px] font-black gradient-text-animate leading-none animate-countdown-pulse">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-[28px] font-extrabold text-white/90 mt-[10px] tracking-[2px]">
                                SECONDES
                            </div>
                        </div>

                        {/* Particles */}
                        <div className="absolute w-full h-full">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-primary rounded-full opacity-60 animate-float-particle"
                                    style={{
                                        top: `${[10, 20, 70, 80, 70, 30][i]}%`,
                                        left: `${[50, 80, 85, 50, 15, 20][i]}%`,
                                        animationDelay: `${i * 0.5}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}