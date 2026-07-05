/**
 * Constantes de gameplay quiz — miroir du barème implémenté côté API
 * (apps/api/src/quiz/quiz.service.ts). L'API reste la source de vérité ;
 * ces constantes servent à l'affichage côté front (prévisualisation XP,
 * barres de temps…).
 */

/** XP de base par niveau de difficulté */
export const XP_BASE: Record<number, number> = { 1: 10, 2: 15, 3: 20, 4: 30 };

/** Multiplicateurs de vitesse (réponse en ms) */
export const SPEED_MULTIPLIERS = [
  { maxMs: 1000, mult: 1.5 },
  { maxMs: 2000, mult: 1.3 },
  { maxMs: 3000, mult: 1.1 },
  { maxMs: 4000, mult: 1.0 },
  { maxMs: 5500, mult: 0.8 },
] as const;

export const XP_WRONG = 2;
export const XP_SKIP = 0;

/** Bonus combo : +10 % par bonne réponse consécutive, plafonné à 5 */
export const COMBO_MAX = 5;
export const COMBO_BONUS_PER_STEP = 0.1;
