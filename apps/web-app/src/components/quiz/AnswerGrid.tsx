'use client';

interface AnswerGridProps {
  options: { key: string; text: string }[];
  selected: string | null;
  correctAnswer: string | null; // null = not yet revealed
  disabled: boolean;
  onSelect: (key: string) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function AnswerGrid({
  options,
  selected,
  correctAnswer,
  disabled,
  onSelect,
}: AnswerGridProps) {
  const isRevealed = correctAnswer !== null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {options.map((opt, idx) => {
        const isSelected = selected === opt.key;
        const isCorrectOption = correctAnswer === opt.key;
        const isWrong = isRevealed && isSelected && !isCorrectOption;

        let stateClasses =
          'border-white/15 bg-white/10 hover:border-primary hover:bg-white/[0.18] motion-safe:hover:-translate-y-0.5';

        if (isSelected && !isRevealed) {
          stateClasses =
            'border-primary bg-primary/25 shadow-[0_0_0_4px_rgba(210,122,45,0.2)]';
        } else if (isRevealed && isCorrectOption) {
          stateClasses =
            'border-emerald-400 bg-emerald-500/25 scale-[1.02] shadow-[0_0_0_4px_rgba(16,185,129,0.2)]';
        } else if (isWrong) {
          stateClasses =
            'border-red-500 bg-red-500/20 shadow-[0_0_0_4px_rgba(239,68,68,0.18)] motion-safe:animate-wiggle-once';
        } else if (isRevealed) {
          stateClasses = 'border-white/10 bg-white/5 opacity-40';
        }

        return (
          <button
            key={opt.key}
            onClick={() => !disabled && onSelect(opt.key)}
            disabled={disabled}
            className={`
              relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 min-h-[64px] sm:min-h-[80px]
              border-2 rounded-2xl cursor-pointer
              transition-all duration-200 ease-out
              backdrop-blur
              motion-safe:active:scale-[0.98]
              disabled:cursor-default
              ${stateClasses}
            `}
            aria-label={`Réponse ${OPTION_LABELS[idx]}: ${opt.text}`}
          >
            <span
              className={`
                flex-none w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center
                font-extrabold text-sm transition-colors
                ${
                  isRevealed && isCorrectOption
                    ? 'bg-emerald-500 text-white'
                    : isWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                        ? 'bg-primary text-white'
                        : 'bg-white/15 text-white'
                }
              `}
            >
              {OPTION_LABELS[idx]}
            </span>
            <span className="text-sm sm:text-base font-bold text-white text-left flex-1">
              {opt.text}
            </span>
            {isRevealed && isCorrectOption && (
              <svg className="w-6 h-6 text-emerald-400 flex-none" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {isWrong && (
              <svg className="w-6 h-6 text-red-400 flex-none" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
