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
  const borderColor = isCorrect ? 'border-emerald-400/60' : 'border-red-400/60';
  const titleColor = isCorrect ? 'text-emerald-300' : 'text-red-300';
  const icon = isCorrect ? '✅' : '❌';

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 mt-4 border-2 bg-white/5 backdrop-blur animate-slide-up ${borderColor}`}
    >
      <h4 className={`text-base sm:text-lg font-extrabold mb-3 ${titleColor}`}>
        {icon} {isCorrect ? 'Bonne réponse !' : `Mauvaise réponse — La bonne réponse était ${correctAnswer}`}
      </h4>

      {feedback?.keyMessage && (
        <p className="text-sm font-semibold text-white/90 mb-2">
          💡 {feedback.keyMessage}
        </p>
      )}

      {feedback?.essentialPoints && feedback.essentialPoints.length > 0 && (
        <ul className="text-sm text-white/75 mb-2 space-y-1">
          {feedback.essentialPoints.map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary-light">•</span>
              {point}
            </li>
          ))}
        </ul>
      )}

      {feedback?.example && (
        <p className="text-sm text-white/60 italic">
          📎 {feedback.example}
        </p>
      )}

      {feedback?.trap && (
        <p className="text-sm text-red-300/90 mt-1">
          ⚠️ Piège courant : {feedback.trap}
        </p>
      )}
    </div>
  );
}
