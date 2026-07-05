/**
 * Types et labels du domaine Question — source canonique partagée.
 *
 * NOTE : IQuestion/IPack/ICategory ont divergé entre web-app et web-admin
 * (le modèle web-app porte encore leaseType/code, absents de la base).
 * Leur unification ici se fera avec le refactor LEASE_TYPE_LABELS
 * (voir TODO.md — "incohérence de modèle").
 */

export type QuestionStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type DifficultyLevel = 1 | 2 | 3 | 4;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'Facile',
  2: 'Moyen',
  3: 'Difficile',
  4: 'Étude de cas',
};

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  ARCHIVED: 'Archivé',
};
