# @ipf/shared — Types & constantes de domaine partagés

Package workspace consommé par `web-app` et `web-admin` (et à terme `api`).
Build ESM (`npm run build --workspace=@ipf/shared`), consommé compilé
(`dist/`) — aucun réglage `transpilePackages` nécessaire.

## Contenu actuel (v1)

- `question.ts` — `QuestionStatus`, `DifficultyLevel`, `STATUS_LABELS`, `DIFFICULTY_LABELS`
- `quiz.ts` — barème XP (miroir de l'API : `XP_BASE`, `SPEED_MULTIPLIERS`, combo)
- `roles.ts` — `UserRole`, `PlanSlug`

## Règles

1. **L'API reste la source de vérité** pour toute logique de gameplay ;
   ce package n'expose que des types et des constantes d'affichage.
2. Tout nouveau type utilisé par ≥2 apps se définit ICI, pas dans une app.
3. Les apps ré-exportent depuis leurs fichiers de types historiques
   (`apps/web-admin/src/lib/types.ts`, `apps/web-app/src/lib/question.types.ts`)
   pour ne pas casser les imports existants.

## À venir

L'unification de `IQuestion`/`IPack`/`ICategory` (divergés entre web-app et
web-admin) se fera avec le refactor `LEASE_TYPE_LABELS` — voir TODO.md.
