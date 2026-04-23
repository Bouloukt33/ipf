'use client';

import Image from 'next/image';

interface MascotDisplayProps {
  variant: string;
  message?: string;
  className?: string;
  size?: number;
}

const MASCOT_MAP: Record<string, string> = {
  happy: '/mascots/joyeux.png',
  sad: '/mascots/triste.png',
  bravo: '/mascots/bravo.png',
  applaudit: '/mascots/applaudit.png',
  perfect: '/mascots/felicitations100.png',
  great: '/mascots/applaudit.png',
  good: '/mascots/bravo.png',
  moderate: '/mascots/gene.png',
  encourage: '/mascots/fais_confiance.png',
  thinking: '/mascots/pensif.png',
  ready: '/mascots/pret.png',
  coach: '/mascots/coach.png',
  go: '/mascots/go.png',
  timeout: '/mascots/time_is_up.png',
  revise: '/mascots/reviser.png',
  pedagogue: '/mascots/pedagogue.png',
  choice: '/mascots/faire_choix.png',
  welcome: '/mascots/bienvenue.png',
  impatient: '/mascots/impatient.png',
};

export default function MascotDisplay({
  variant,
  message,
  className = '',
  size = 220,
}: MascotDisplayProps) {
  const src = MASCOT_MAP[variant] || MASCOT_MAP.happy;

  return (
    <div className={`relative ${className}`}>
      {message && (
        <div
          className="absolute -top-20 right-0 bg-white px-5 py-3 rounded-[20px] border-3 border-primary max-w-[240px] z-10 animate-fade-in-up"
          style={{ borderWidth: '3px' }}
        >
          <p className="text-sm font-bold text-navy">{message}</p>
          {/* Speech bubble arrow */}
          <div
            className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-[3px] border-b-[3px] border-primary rotate-45"
          />
        </div>
      )}
      <Image
        src={src}
        alt="Mascotte"
        width={size}
        height={size}
        className="object-contain drop-shadow-[0_8px_24px_rgba(23,46,66,0.2)] animate-bounce-soft"
        priority
      />
    </div>
  );
}
