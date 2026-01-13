'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
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
    <section id="accueil" className="min-h-screen pt-[140px] pb-20 px-10 relative overflow-hidden flex items-center">
      {/* Animated Background */}
      <div className="absolute w-full h-full top-0 left-0 overflow-hidden">
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10 bg-primary top-[10%] right-[10%] animate-float-around" />
        <div className="absolute w-[200px] h-[200px] rounded-full opacity-10 bg-[#4dabf7] bottom-[20%] left-[15%] animate-float-around [animation-delay:3s]" />
        <div className="absolute w-[250px] h-[250px] rounded-full opacity-10 bg-primary top-[60%] right-[25%] animate-float-around [animation-delay:6s]" />
      </div>

      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-20 items-center relative z-[1]">
        {/* Content */}
        <div>
          <h1 className="text-[68px] font-black mb-[30px] leading-[1.1] text-white">
            Maîtrisez l'immobilier
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              en 5 secondes chrono ⚡
            </span>
          </h1>
          
          <p className="text-[22px] mb-[45px] leading-[1.6] text-white/85 font-semibold">
            Transformez votre apprentissage avec une méthode révolutionnaire. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.
          </p>
          
          <div className="flex gap-5 mb-[60px] flex-wrap">
            <Link 
              href="/register" 
              className="px-[50px] py-[22px] bg-gradient-primary text-white border-none rounded-[50px] font-black cursor-pointer transition-all duration-300 no-underline text-lg shadow-primary hover:-translate-y-[5px] hover:scale-105 hover:shadow-primary-lg"
            >
              Commencer gratuitement
            </Link>
            <Link 
              href="#fonctionnalites" 
              className="px-[50px] py-[22px] bg-white/10 text-white border-[3px] border-white/30 rounded-[50px] font-black cursor-pointer transition-all duration-300 no-underline text-lg hover:bg-white/20 hover:border-white hover:-translate-y-[3px]"
            >
              Découvrir
            </Link>
          </div>

          <div className="flex gap-[50px] flex-wrap">
            {[
              { number: '50+', label: 'Questions' },
              { number: '5min', label: 'Par jour' },
              { number: '100%', label: 'Efficace' },
            ].map((stat) => (
              <div 
                key={stat.label}
                className="bg-gradient-to-br from-primary/15 to-primary-light/15 backdrop-blur-[10px] border-2 border-primary/30 rounded-[20px] px-[30px] py-5 text-center"
              >
                <span className="text-5xl font-black bg-gradient-primary bg-clip-text text-transparent block">
                  {stat.number}
                </span>
                <span className="text-sm opacity-80 font-bold mt-[5px] block">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center items-center">
          <div className="relative w-[450px] h-[450px] flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary-light/20 border-[8px] border-primary/40 animate-pulse-ring" />
            
            <div className="relative w-[350px] h-[350px] bg-gradient-to-br from-dark-300/95 to-dark-100/95 backdrop-blur-[20px] rounded-full flex flex-col items-center justify-center border-[6px] border-primary/50 shadow-[0_30px_80px_rgba(210,122,45,0.3),inset_0_0_50px_rgba(210,122,45,0.1)]">
              <div className="text-[120px] font-black bg-gradient-primary bg-clip-text text-transparent leading-none animate-countdown-pulse">
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