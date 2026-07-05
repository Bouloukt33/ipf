'use client';

import { CheckCircle2, XCircle, Lightbulb, TriangleAlert, Zap } from 'lucide-react';
import type { FeedbackData } from '@/lib/api';

interface FeedbackInlineProps {
  isCorrect: boolean;
  /** Lettre de la bonne réponse (A–D). */
  correctKey: string;
  /** Texte de la bonne réponse. */
  correctAnswer: string;
  /** XP gagnés sur cette question (affiché si > 0). */
  xpEarned: number;
  feedback: FeedbackData | null;
}

export default function FeedbackInline({
  isCorrect,
  correctKey,
  correctAnswer,
  xpEarned,
  feedback,
}: FeedbackInlineProps) {
  const hasHint =
    feedback?.keyMessage ||
    (feedback?.essentialPoints && feedback.essentialPoints.length > 0) ||
    feedback?.example ||
    feedback?.trap;

  return (
    <div
      className={`rounded-2xl mt-4 border-2 bg-white/5 backdrop-blur overflow-hidden animate-slide-up ${
        isCorrect ? 'border-emerald-400/50' : 'border-red-400/50'
      }`}
    >
      {/* Bandeau verdict */}
      <div
        className={`flex items-center gap-2.5 px-4 py-3 ${
          isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 size={20} className="text-emerald-300 flex-shrink-0" aria-hidden />
        ) : (
          <XCircle size={20} className="text-red-300 flex-shrink-0" aria-hidden />
        )}
        <h4
          className={`text-sm sm:text-base font-black flex-1 ${
            isCorrect ? 'text-emerald-300' : 'text-red-300'
          }`}
        >
          {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
        </h4>
        {isCorrect && xpEarned > 0 && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20
              border border-amber-300/30 text-amber-300 text-xs font-black animate-scale-in"
          >
            <Zap size={12} className="fill-amber-300" aria-hidden />
            +{xpEarned} XP
          </span>
        )}
      </div>

      {/* La bonne réponse, mise en vedette quand on s'est trompé */}
      {!isCorrect && (
        <div className="mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40">
          <span
            className="flex-none w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center
              text-xs font-extrabold"
            aria-hidden
          >
            {correctKey}
          </span>
          <p className="text-sm font-bold text-white leading-snug">
            <span className="text-emerald-300">La bonne réponse : </span>
            {correctAnswer}
          </p>
          <CheckCircle2 size={18} className="ml-auto text-emerald-300 flex-shrink-0" aria-hidden />
        </div>
      )}

      {/* Le mot du coach — compact */}
      {hasHint && (
        <div className="px-4 py-3 space-y-1.5">
          {feedback?.keyMessage && (
            <p className="flex gap-2 text-[13px] font-semibold text-white/85 leading-snug">
              <Lightbulb size={15} className="text-amber-300 flex-shrink-0 mt-0.5" aria-hidden />
              <span>{feedback.keyMessage}</span>
            </p>
          )}

          {feedback?.essentialPoints && feedback.essentialPoints.length > 0 && (
            <ul className="text-[12.5px] text-white/65 space-y-1 pl-[23px]">
              {feedback.essentialPoints.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary-light" aria-hidden>•</span>
                  {point}
                </li>
              ))}
            </ul>
          )}

          {feedback?.example && (
            <p className="text-[12.5px] text-white/55 italic pl-[23px]">{feedback.example}</p>
          )}

          {feedback?.trap && (
            <p className="flex gap-2 text-[12.5px] text-red-300/90 leading-snug">
              <TriangleAlert size={14} className="flex-shrink-0 mt-0.5" aria-hidden />
              <span>Piège courant : {feedback.trap}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
