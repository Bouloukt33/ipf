/**
 * Types et labels du domaine Pack — source canonique partagée.
 *
 * Le statut à 3 états vient du point client n°8 (30/06/2026) :
 * ACTIVE = visible et jouable, SUSPENDED = retiré temporairement du
 * catalogue, DISABLED = désactivé. Côté gameplay, seuls les packs
 * ACTIVE sont servis (le miroir booléen `isActive` reste la source
 * de filtrage des endpoints publics).
 */

export type PackStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export const PACK_STATUS_LABELS: Record<PackStatus, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  DISABLED: 'Désactivé',
};
