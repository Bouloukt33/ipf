# CLAUDE.md — IPF / 5 Secondes Chrono

Quiz immobilier gamifié (Le Carré PRO). Monorepo **npm workspaces** — un seul
`package-lock.json` à la racine. **Jamais pnpm/yarn, jamais `npm install` dans
une app.**

## Structure

| Workspace | Stack | Port |
|---|---|---|
| `apps/api` | NestJS 11 + Prisma 7 + PostgreSQL + Redis, Auth0 JWT (JWKS RS256) | 3000 |
| `apps/web-app` | Next.js 15 App Router (React 18), Tailwind, Zustand — app apprenant | 3001 |
| `apps/web-admin` | React 18 + Vite 7, react-router 7, Recharts — dashboard admin (nginx en Docker : 3002) | 5173 |
| `apps/landing` | Next.js 15 standalone — vitrine SEO | 3004 |
| `packages/shared` | `@ipf/shared` — types & constantes de domaine partagés (ESM, buildé) | — |

`packages/ui`, `packages/testing`, `packages/ai-models` : placeholders, rien dedans.

## Commandes (toujours depuis la racine)

```bash
npm install                    # unique point d'installation
npm run dev                    # api + web-app + admin en parallèle
npm run build|test|lint|typecheck    # tous les workspaces
npm run <script> --workspace=<nom>   # ciblé
docker compose up -d           # infra seule (Postgres+Redis)
docker compose --profile app up -d --build   # tout en conteneurs (contexte racine)
```

**Critère de fin de tâche** : `npm run typecheck && npm run lint && npm test && npm run build` verts. La CI (`.github/workflows/ci.yml`) rejoue exactement ça + les builds Docker.

## Pièges connus

- **Prisma** : client généré dans le `node_modules` RACINE (`schema.prisma` → `output = ../../../node_modules/.prisma/client`). Après modif du schéma : `npm run seed`/`npx prisma generate` depuis `apps/api`. Prisma 7 : la datasource URL vit dans `prisma.config.ts`, pas dans le schema.
- **Docker** : tous les Dockerfiles buildent depuis la RACINE (`context: .`). Ne jamais remettre un `COPY package-lock.json` local à une app.
- **Migrations** : exécutées au boot du conteneur API, **fail-fast** — un conteneur api qui boucle = migration en échec, lire `docker logs ipf-api`.
- **`.env`** : jamais commité. Racine = Docker/Auth0 ; `apps/api/.env` = DATABASE_URL locale.
- **Dette lint encadrée** : les règles `no-unsafe-*` (api) et `no-explicit-any` (web-admin) sont en `warn` sur l'existant — **interdites dans le nouveau code** (voir skills). Ne pas introduire de nouveaux `any`.
- **Modèle fantôme** : `LeaseType`/`code` côté web-app ne correspondent pas à la base (slugs réels : `bail-commercial`…). Refactor prévu — voir TODO.md avant de toucher aux types Question.

## Conventions

- **Git** : GitFlow (`develop` = intégration, `feature/*`, commits conventionnels `feat:|fix:|chore:|ci:`).
- **Types partagés** : tout type utilisé par ≥2 apps va dans `@ipf/shared`, pas en double.
- **L'API est la source de vérité** du gameplay (barème XP, vies, combos) ; le front n'en garde que des miroirs d'affichage importés de `@ipf/shared`.
- **Français** pour l'UI et messages d'erreur utilisateur ; anglais pour le code/identifiants.

## Skills (lire avant d'agir)

| Skill | Quand |
|---|---|
| `project-structure` | Créer un module/page/service — où va quoi |
| `api-conventions` | Tout endpoint NestJS (DTO, guards, Prisma, pagination) |
| `writing-tests` | Écrire/corriger des tests (Jest API, front) |
| `frontend-design` | UI, design system, animations |
| `green-it-performance` | Perf, bundle, requêtes, images, cache |
