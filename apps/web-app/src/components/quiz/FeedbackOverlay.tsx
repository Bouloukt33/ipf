'use client';

import { useEffect } from 'react';
import MascotDisplay from './MascotDisplay';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  show: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function FeedbackOverlay({
  isCorrect,
  show,
  onDismiss,
  autoDismissMs = 2000,
}: FeedbackOverlayProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [show, onDismiss, autoDismissMs]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/85 backdrop-blur-[12px] animate-[fadeIn_0.3s_ease-out]"
      onClick={onDismiss}
    >
      <div className="text-center animate-[slideUpFade_0.5s_ease-out] max-w-[90%]">
        <div className="animate-scale-in">
          <MascotDisplay
            variant={isCorrect ? 'bravo' : 'sad'}
            size={200}
            className="mx-auto mb-8"
          />
        </div>
        <h2
          className={`text-5xl font-black uppercase tracking-[4px] mb-4 ${
            isCorrect ? 'text-emerald-500' : 'text-red-500'
          }`}
          style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          {isCorrect ? 'Correct !' : 'Incorrect !'}
        </h2>
        <p className="text-white/70 text-lg font-semibold">
          {isCorrect ? 'Continue comme ça 🔥' : 'Tu feras mieux la prochaine fois 💪'}
        </p>
      </div>
    </div>
  );
}
