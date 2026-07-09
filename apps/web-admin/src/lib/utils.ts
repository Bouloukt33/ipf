import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CSSProperties } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Entrée en scène décalée (avec motion-safe:animate-fade-in-*) :
 * fill-mode backwards maintient l'état 0 % pendant le délai.
 */
export function enterAt(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms`, animationFillMode: 'backwards' }
}
