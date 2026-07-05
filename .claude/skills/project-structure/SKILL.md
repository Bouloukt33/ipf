---
name: project-structure
description: Où créer chaque fichier dans le monorepo IPF — module NestJS complet, page Next.js App Router, page admin Vite, type partagé. À lire AVANT de créer un fichier ou déplacer du code, pour toute feature touchant api, web-app, web-admin ou packages/shared.
---

# Structure du projet — où va quoi

## Nouveau domaine côté API (`apps/api/src/<domaine>/`)

Un module NestJS complet = un dossier par domaine, calqué sur `quiz/` ou `packs/` :

```
src/<domaine>/
├── <domaine>.module.ts        # imports PrismaModule si besoin
├── <domaine>.controller.ts    # routes + Swagger @ApiTags/@ApiOperation
├── <domaine>.service.ts       # logique métier + Prisma
├── <domaine>.service.spec.ts  # tests unitaires (mock PrismaService)
├── dto/                       # class-validator DTOs (voir api-conventions)
└── index.ts                   # barrel export
```

Enregistrer le module dans `app.module.ts`. Ne JAMAIS mettre de logique métier
dans le controller.

## Nouvelle page web-app (Next.js 15 App Router)

```
apps/web-app/src/
├── app/<route>/page.tsx           # Server Component par défaut
├── components/<domaine>/          # composants du domaine ('use client' si interactif)
├── services/<domaine>.service.ts  # appels API (apiFetch + API_ENDPOINTS)
├── hooks/use<Domaine>.ts          # état + fetch orchestration
├── store/                         # stores Zustand (état global uniquement)
└── lib/<domaine>.types.ts         # types locaux (partagés → @ipf/shared !)
```

- Routes protégées : le middleware Auth0 (`src/middleware.ts`) couvre tout sauf
  les assets — pas de garde à la main dans les pages.
- Les appels API passent par `services/`, jamais de `fetch` inline dans un composant.

## Nouvelle page web-admin (Vite + react-router)

```
apps/web-admin/src/
├── pages/<Nom>Page.tsx            # enregistrée dans App.tsx (react-router 7)
├── components/admin/              # composants (Modal, Row, Filters par entité)
├── services/<domaine>.service.ts  # apiRequest(endpoint, token)
└── hooks/useAdmin<Domaine>.ts     # fetch + état local
```

Le token Auth0 vient de `@auth0/auth0-react` (`getAccessTokenSilently`) et se
passe explicitement aux services.

## Types partagés

**Règle absolue** : un type/constante utilisé par ≥2 apps se définit dans
`packages/shared/src/` (`@ipf/shared`), jamais en double.

- Ajouter dans `packages/shared/src/<fichier>.ts`, exporter dans `index.ts`
  (imports internes AVEC extension `.js` — package ESM).
- Rebuild : `npm run build --workspace=@ipf/shared`.
- Les apps ré-exportent depuis leurs fichiers de types historiques pour
  compatibilité (`apps/web-admin/src/lib/types.ts`, `apps/web-app/src/lib/question.types.ts`).

## Interdits

- ❌ `npm install` dans un dossier d'app (toujours à la racine)
- ❌ Dépendance runtime dans le `package.json` racine (outillage uniquement)
- ❌ Copier un service/type d'une app vers l'autre (→ `@ipf/shared`)
- ❌ Nouveau `any` (dette existante en `warn`, gelée — pas de nouveaux cas)
- ❌ Logique de gameplay (XP, vies) côté front — l'API est la source de vérité
