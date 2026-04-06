'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TimerProps {
  duration: number; // seconds
  isRunning: boolean;
  onTimeout: () => void;
}

export default function Timer({ duration, isRunning, onTimeout }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const hasTimedOut = useRef(false);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    setTimeLeft(remaining);

    if (remaining <= 0 && !hasTimedOut.current) {
      hasTimedOut.current = true;
      onTimeout();
      return;
    }

    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [duration, onTimeout]);

  useEffect(() => {
    if (isRunning) {
      hasTimedOut.current = false;
      setTimeLeft(duration);
      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, duration, tick]);

  const progress = timeLeft / duration;
  const offset = circumference * (1 - progress);
  const displayTime = Math.ceil(timeLeft);

  const colorClass =
    timeLeft <= 1 ? 'stroke-red-600' : timeLeft <= 2 ? 'stroke-amber-500' : 'stroke-primary';
  const pulseClass = timeLeft <= 1 ? 'animate-countdown-pulse' : '';

  return (
    <div
      className="relative w-[120px] h-[120px] mx-auto"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(210,122,45,0.25))' }}
    >
      <svg
        className="-rotate-90"
        width="120"
        height="120"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(210,122,45,0.15)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className={`${colorClass} ${pulseClass}`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-4xl font-black ${
            timeLeft <= 1 ? 'text-red-600' : timeLeft <= 2 ? 'text-amber-500' : 'text-navy'
          }`}
        >
          {displayTime}
        </span>
      </div>
    </div>
  );
}
