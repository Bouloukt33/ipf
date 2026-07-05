'use client';

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
}

/** Cœurs de vies — pastille verre dépoli pensée pour l'arène navy du quiz. */
export default function LivesDisplay({ lives, maxLives = 5 }: LivesDisplayProps) {
  const isLastLife = lives === 1;

  return (
    <div
      className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur"
      role="img"
      aria-label={`${lives} vies restantes sur ${maxLives}`}
    >
      {Array.from({ length: maxLives }, (_, i) => {
        const isAlive = i < lives;
        return (
          <svg
            key={i}
            className={`w-[16px] h-[16px] sm:w-[20px] sm:h-[20px] transition-all duration-300 ${
              isAlive
                ? `drop-shadow-[0_2px_6px_rgba(239,68,68,0.5)] ${
                    isLastLife ? 'motion-safe:animate-countdown-pulse' : ''
                  }`
                : 'opacity-25 scale-90'
            }`}
            viewBox="0 0 24 24"
            fill={isAlive ? '#EF4444' : 'rgba(255,255,255,0.35)'}
            aria-hidden
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      })}
    </div>
  );
}
