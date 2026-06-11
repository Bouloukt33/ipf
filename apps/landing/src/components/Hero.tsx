'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

const QUIZ_CARDS = [
    {
        category: 'Bail commercial',
        question: 'Quelle est la durée minimale d\'un bail commercial ?',
        answers: ['3 ans', '6 ans', '9 ans', '12 ans'],
        correctIndex: 0,
    },
    {
        category: 'Bail professionnel',
        question: 'Le bail professionnel a une durée minimale de ?',
        answers: ['2 ans', '4 ans', '6 ans', '9 ans'],
        correctIndex: 2,
    },
    {
        category: 'Droit au bail',
        question: 'Le droit au bail appartient à ?',
        answers: ['Au bailleur', 'Au locataire', 'Aux deux', 'À l\'État'],
        correctIndex: 1,
    },
];

const CIRCUMFERENCE = 2 * Math.PI * 28;

export default function Hero() {
    const [cardIndex, setCardIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [answered, setAnswered] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (answered) {
            const t = setTimeout(() => {
                setCardIndex((i) => (i + 1) % QUIZ_CARDS.length);
                setAnswered(false);
                setTimeLeft(5);
            }, 1500);
            return () => clearTimeout(t);
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setAnswered(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [answered]);

    const card = QUIZ_CARDS[cardIndex];
    const dashOffset = CIRCUMFERENCE * (1 - timeLeft / 5);
    const timerColor = timeLeft <= 2 ? '#ef4444' : '#D27A2D';

    return (
        <section className="min-h-screen flex items-center pt-20 pb-16 px-6 bg-white overflow-hidden relative">
            {/* Bienvenue — grande mascotte fond centré */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="w-[60vw] max-w-[720px] opacity-[0.12]">
                    <Image
                        src="/mascotte/no_bg/bienvenue.png"
                        alt=""
                        width={720}
                        height={900}
                        className="object-contain w-full"
                        aria-hidden="true"
                        priority
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full relative">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left — Texte */}
                    <div
                        className="transition-all duration-700"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(24px)',
                        }}
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2 mb-8">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse inline-block" />
                            <span className="text-sm font-bold text-primary">La méthode des pros de l'immobilier</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-black text-navy leading-[1.1] mb-6">
                            Maîtrisez l'immo
                            <span className="block gradient-text-animate">commercial</span>
                            en 5 secondes
                        </h1>

                        <p className="text-lg text-charcoal/60 font-semibold mb-10 leading-relaxed max-w-md">
                            Quiz chronométrés, progression gamifiée, coach IA.
                            Apprenez comme les meilleurs professionnels.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href={`${APP_URL}/auth/login`}
                                className="px-8 py-4 bg-gradient-primary text-white rounded-2xl font-black text-lg text-center no-underline btn-3d-primary"
                            >
                                Commencer gratuitement
                            </a>
                            <a
                                href={`${APP_URL}/auth/login`}
                                className="px-8 py-4 border-2 border-navy/15 text-navy/70 rounded-2xl font-bold text-lg hover:border-primary hover:text-primary transition-colors text-center no-underline btn-3d-secondary"
                            >
                                J'ai déjà un compte
                            </a>
                        </div>

                        <div className="flex items-center gap-6 mt-10">
                            <div className="flex -space-x-2">
                                {['#D27A2D', '#172E42', '#e8924a', '#2A262A'].map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black"
                                        style={{ backgroundColor: color }}
                                    >
                                        {['A', 'B', 'C', 'D'][i]}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-charcoal/60">
                                <span className="font-black text-navy">500+ professionnels</span> nous font confiance
                            </p>
                        </div>
                    </div>

                    {/* Right — Quiz card */}
                    <div
                        className="transition-all duration-700 delay-200"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(24px)',
                        }}
                    >
                        <div className="relative max-w-sm mx-auto">
                            {/* Quiz card */}
                            <div className="relative bg-navy rounded-3xl p-8 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-xs font-black text-primary uppercase tracking-wider bg-primary/15 px-3 py-1.5 rounded-full">
                                        {card.category}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs text-white/40 font-bold">Live</span>
                                    </div>
                                </div>

                                {/* Question */}
                                <p className="text-white text-base font-bold mb-7 leading-relaxed min-h-[3rem]">
                                    {card.question}
                                </p>

                                {/* Answers */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {card.answers.map((answer, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-xl px-4 py-3 text-sm font-bold text-center transition-all duration-500 ${
                                                answered && i === card.correctIndex
                                                    ? 'bg-emerald-500 text-white scale-105'
                                                    : answered
                                                    ? 'bg-white/5 text-white/30'
                                                    : 'bg-white/10 text-white/80'
                                            }`}
                                        >
                                            {answer}
                                        </div>
                                    ))}
                                </div>

                                {/* Timer */}
                                <div className="flex items-center justify-center gap-4">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                                            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                                            <circle
                                                cx="36" cy="36" r="28"
                                                fill="none"
                                                stroke={answered ? '#10b981' : timerColor}
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                strokeDasharray={CIRCUMFERENCE}
                                                strokeDashoffset={answered ? 0 : dashOffset}
                                                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                                            />
                                        </svg>
                                        <div className={`absolute inset-0 flex items-center justify-center font-black text-xl transition-colors duration-300 ${answered ? 'text-emerald-400' : timeLeft <= 2 ? 'text-red-400' : 'text-white'}`}>
                                            {answered ? (
                                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : timeLeft}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs font-bold uppercase tracking-wider">
                                            {answered ? 'Bonne réponse !' : 'Secondes restantes'}
                                        </p>
                                        <div className="flex gap-1 mt-1">
                                            {QUIZ_CARDS.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 rounded-full transition-all duration-300 ${
                                                        i === cardIndex ? 'w-6 bg-primary' : 'w-2 bg-white/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
