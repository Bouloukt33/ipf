import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Zone } from "./type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getZone(): Zone {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1200) return 'tablet';
    return 'desktop';
}
