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
          'border-primary/20 bg-white/95 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5';

        if (isSelected && !isRevealed) {
          stateClasses =
            'border-primary bg-primary/10 translate-y-1 shadow-[0_2px_0_#D27A2D]';
        } else if (isRevealed && isCorrectOption) {
          stateClasses =
            'border-emerald-500 bg-emerald-500/15 -translate-y-0.5 shadow-[0_2px_0_#10B981]';
        } else if (isWrong) {
          stateClasses =
            'border-red-600 bg-gradient-to-br from-red-600/15 to-red-500/15 shadow-[0_0_0_4px_rgba(220,38,38,0.15)]';
        } else if (isRevealed) {
          stateClasses = 'border-primary/10 bg-white/60 opacity-60';
        }

        return (
          <button
            key={opt.key}
            onClick={() => !disabled && onSelect(opt.key)}
            disabled={disabled}
            className={`
              relative flex items-center gap-4 p-5 min-h-[80px]
              border-[3px] rounded-2xl cursor-pointer
              transition-all duration-300 ease-out
              backdrop-blur-[10px]
              shadow-[0_4px_12px_rgba(23,46,66,0.06)]
              disabled:cursor-default
              ${stateClasses}
            `}
            aria-label={`Réponse ${OPTION_LABELS[idx]}: ${opt.text}`}
          >
            <span
              className={`
                flex-none w-9 h-9 rounded-xl flex items-center justify-center
                font-extrabold text-sm
                ${
                  isRevealed && isCorrectOption
                    ? 'bg-emerald-500 text-white'
                    : isWrong
                      ? 'bg-red-600 text-white'
                      : isSelected
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary'
                }
              `}
            >
              {OPTION_LABELS[idx]}
            </span>
            <span className="text-base font-bold text-navy text-left flex-1">
              {opt.text}
            </span>
            {isRevealed && isCorrectOption && (
              <svg className="w-6 h-6 text-emerald-500 flex-none" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {isWrong && (
              <svg className="w-6 h-6 text-red-600 flex-none" fill="currentColor" viewBox="0 0 20 20">
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
