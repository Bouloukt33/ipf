import { DIFFICULTY_LEVEL_MAP, DifficultyLevel, LeaseType } from "./question.types";

/**
 * Generates a question code following the pattern:
 * <LEASETYPE(3)>COM<DIFFICULTY_SHORT><INDEX padded to 3>
 * e.g. COMCOMF001, PROCOMD010, COMCOMEC002
 */
export function generateQuestionCode(
  leaseType: LeaseType,
  difficulty: DifficultyLevel,
  index: number
): string {
  const leasePrefix = leaseType.slice(0, 3).toUpperCase();
  const diffShort = DIFFICULTY_LEVEL_MAP[difficulty];
  const paddedIndex = String(index).padStart(3, '0');
  return `${leasePrefix}COM${diffShort}${paddedIndex}`;
}

/**
 * Returns the next available index for a given lease type + difficulty combo
 * by scanning existing codes.
 */
export function getNextIndex(
  existingCodes: string[],
  leaseType: LeaseType,
  difficulty: DifficultyLevel
): number {
  const prefix = `${leaseType.slice(0, 3).toUpperCase()}COM${DIFFICULTY_LEVEL_MAP[difficulty]}`;
  const matching = existingCodes
    .filter((c) => c.startsWith(prefix))
    .map((c) => parseInt(c.replace(prefix, ''), 10))
    .filter((n) => !isNaN(n));
  return matching.length > 0 ? Math.max(...matching) + 1 : 1;
}

/**
 * Format seconds into a readable duration label.
 */
export function formatDuration(seconds: number): string {
  return `${seconds}s`;
}

/**
 * Truncate text to a given max length with ellipsis.
 */
export function truncateText(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
