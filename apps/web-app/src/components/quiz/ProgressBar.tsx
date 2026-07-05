'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div
      className={`h-2.5 bg-white/10 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Question ${current} sur ${total}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-[width] duration-400 ease-out"
        style={{
          width: `${percent}%`,
          boxShadow: '0 2px 8px rgba(210,122,45,0.4)',
        }}
      />
    </div>
  );
}
