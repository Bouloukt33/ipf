'use client';

import type { FeedbackData } from '@/lib/api';

interface FeedbackInlineProps {
  isCorrect: boolean;
  correctAnswer: string;
  feedback: FeedbackData | null;
}

export default function FeedbackInline({
  isCorrect,
  correctAnswer,
  feedback,
}: FeedbackInlineProps) {
  const borderColor = isCorrect ? 'border-emerald-500' : 'border-red-500';
  const bgGradient = isCorrect
    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
    : 'bg-gradient-to-br from-red-500/10 to-red-600/5';
  const titleColor = isCorrect ? 'text-emerald-600' : 'text-red-600';
  const icon = isCorrect ? '✅' : '❌';

  return (
    <div
      className={`rounded-2xl p-5 mt-4 border-[3px] backdrop-blur-[10px] animate-slide-up ${borderColor} ${bgGradient}`}
    >
      <h4 className={`text-lg font-extrabold mb-3 ${titleColor}`}>
        {icon} {isCorrect ? 'Bonne réponse !' : `Mauvaise réponse — La bonne réponse était ${correctAnswer}`}
      </h4>

      {feedback?.keyMessage && (
        <p className="text-sm font-semibold text-navy mb-2">
          💡 {feedback.keyMessage}
        </p>
      )}

      {feedback?.essentialPoints && feedback.essentialPoints.length > 0 && (
        <ul className="text-sm text-navy/80 mb-2 space-y-1">
          {feedback.essentialPoints.map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              {point}
            </li>
          ))}
        </ul>
      )}

      {feedback?.example && (
        <p className="text-sm text-navy/70 italic">
          📎 {feedback.example}
        </p>
      )}

      {feedback?.trap && (
        <p className="text-sm text-red-600/80 mt-1">
          ⚠️ Piège courant : {feedback.trap}
        </p>
      )}
    </div>
  );
}
