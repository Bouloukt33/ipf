---
name: writing-tests
description: Comment écrire et maintenir les tests IPF — Jest unitaires API avec mock PrismaService, e2e supertest, tests front (Vitest + Testing Library à introduire). À lire avant d'écrire un test, corriger un test cassé, ou livrer une feature (toute feature part avec ses tests).
---

# Tests — conventions IPF

**Règle d'or : une feature sans test n'est pas terminée.** Un service API créé
ou modifié = son `.spec.ts` mis à jour dans le même commit.

## API — tests unitaires (Jest)

Lancer : `npm test --workspace=api` (ou `npx jest` depuis `apps/api`).
Config dans `apps/api/package.json` (`rootDir: src`, pattern `*.spec.ts`).

### Pattern service (le standard du repo)

```ts
const mockPrismaService = {
  user: { findUnique: jest.fn() },
  quizSession: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  // ⚠️ déclarer TOUS les modèles que le service touche, y compris dans les
  // helpers privés (leaderboard, userMastery…) — un modèle manquant =
  // "Cannot read properties of undefined (reading 'findUnique')"
};

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [QuizService, { provide: PrismaService, useValue: mockPrismaService }],
  }).compile();
  service = module.get(QuizService);
});
afterEach(() => jest.clearAllMocks());
```

### Règles apprises des 8 tests qui pourrissaient

1. **Tester le contrat actuel, pas l'historique** : quand un service évolue
   (signature, forme de retour), mettre à jour le spec DANS LE MÊME commit.
2. **Mocks cohérents** : si le test attend `accuracy: 80`, le mock doit avoir
   10 réponses dont 8 correctes — pas des données incohérentes entre elles.
3. Chiffres dérivés de l'implémentation réelle avec commentaire
   (`// 10 × 1.3 = 13`), pas des valeurs devinées.
4. `expect.objectContaining()` pour les créations Prisma (résiste à l'ajout de champs).
5. Cas d'erreur systématiques : NotFound (entité absente), Forbidden
   (mauvais propriétaire), BadRequest (état invalide).

## API — tests e2e (`apps/api/test/`)

- `import request from 'supertest'` (import **default** — `* as` casse avec les types actuels).
- Recréer la config de `main.ts` (ValidationPipe whitelist etc.) dans le `beforeAll`.
- Lancer : `npm run test:e2e --workspace=api` (nécessite Postgres up : `docker compose up -d`).

## Front — Vitest + Testing Library (à introduire au premier test)

Aucun test front n'existe. Au premier test d'un composant :

1. web-admin (Vite) : `vitest` + `@testing-library/react` + `@testing-library/jest-dom`
   + `jsdom`, script `"test": "vitest run"` — la CI le prendra automatiquement
   (`npm test --workspaces --if-present`).
2. web-app (Next) : même stack ; mocker `next/navigation` et `@auth0/nextjs-auth0`.
3. Cibles prioritaires : logique de quiz (timer, sélection réponse), hooks de
   fetch, stores Zustand — pas les rendus statiques.
4. Tester le **comportement visible** (`getByRole`, `getByText`), pas
   l'implémentation (pas de snapshot par défaut).

## Quoi mocker

| Dépendance | Comment |
|---|---|
| Prisma | `useValue: mockPrismaService` (jamais de vraie DB en unitaire) |
| Auth0 (API) | passer par `@CurrentUser()` — tester le service avec un user simulé |
| Auth0 (front) | mocker `useAuth0` / `useUser` |
| Redis/cache | mock `CACHE_MANAGER` si le service l'injecte |
| Horloge | `jest.useFakeTimers()` pour streaks/timers |

## Définition de "vert"

`npm test` depuis la racine = 0 échec. Un test flaky ou obsolète se répare ou
se réécrit — jamais de `.skip` commité sans TODO daté.
