"use client";

import { cn } from "@/lib/utils";

interface ProgressDotsProps {
    total: number;
    current: number; // 0-indexed
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
    return (
        <div className="flex items-center justify-center gap-3 mb-8">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-3 rounded-full transition-all duration-500",
                        i < current
                            ? "w-3 bg-emerald-500"
                            : i === current
                                ? "w-10 bg-primary shadow-[0_2px_8px_rgba(210,122,45,0.4)]"
                                : "w-3 bg-navy/20"
                    )}
                />
            ))}
        </div>
    );
}