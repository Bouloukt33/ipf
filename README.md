# 5 Secondes Chrono - IPF

Application web responsive de quiz immobilier pour Le Carré PRO.

> "5 secondes pour répondre, 5 minutes pour apprendre"

## 🎯 Concept

Plateforme d'apprentissage basée sur les neurosciences pour les professionnels
de l'immobilier d'entreprise (baux commerciaux, professionnels, dérogatoires).

## 📁 Structure Monorepo (npm workspaces)

```
ipf/
├── apps/
│   ├── web-app/      # Application apprenant (Next.js 15 App Router)
│   ├── web-admin/    # Dashboard administrateur (React 18 + Vite 7)
│   ├── landing/      # Site vitrine SEO (Next.js 15, standalone)
│   └── api/          # Backend API (NestJS 11 + Prisma 7)
├── packages/
│   ├── shared/       # @ipf/shared — types & constantes de domaine partagés
│   ├── ui/           # (à venir) Design System partagé
│   ├── testing/      # (à venir) Utils de test partagés
│   └── ai-models/    # (phase 2) Modèles IA coaching
```

**Un seul `package-lock.json`, à la racine.** Toujours lancer `npm install`
depuis la racine du monorepo — jamais dans une app.

## 🔐 Rôles Utilisateurs (Auth0 RBAC)

| Rôle | Accès |
|------|-------|
| **Visiteur** | Démo quiz, pages publiques |
| **Apprenti** | Quiz illimités |
| **Compagnon** | Quiz + Vidéos pédagogiques |
| **Réussite** | Coaching IA personnalisé |
| **Admin** | Dashboard complet |

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Web App (apprenant) | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Zustand |
| Web Admin | React 18, Vite 7, react-router 7, Recharts, Zustand |
| Landing | Next.js 15 (standalone) |
| Backend | NestJS 11, Prisma 7, PostgreSQL 16, Redis 7 |
| Auth | Auth0 (OAuth2/JWT JWKS RS256, RBAC) |
| Partagé | @ipf/shared (types & constantes de domaine) |
| Infra | Docker (multi-stage, contexte racine), GitHub Actions |
| Paiements | Stripe — **phase 2, non intégré** (champs réservés dans le schéma) |
| IA coaching | **phase 2, non implémenté** |

## 🚀 Démarrage

```bash
# Installation (toujours depuis la racine)
npm install

# Infra (Postgres + Redis) via Docker
docker compose up -d

# Développement (api + web-app + admin en parallèle)
npm run dev

# Build / Tests / Lint / Typecheck (tous les workspaces)
npm run build
npm test
npm run lint
npm run typecheck
```

Voir [DOCKER.md](DOCKER.md) pour tout lancer en conteneurs
(`docker compose --profile app up -d --build`).

## 📦 Scripts Workspaces

```bash
npm run dev:web        # Dev web-app (port 3001)
npm run dev:admin      # Dev admin (port 5173)
npm run dev:api        # Dev API (port 3000)
npm run dev:landing    # Dev landing (port 3000 local)

# Cibler un workspace précis :
npm run <script> --workspace=<api|web-app|web-admin|landing|@ipf/shared>
```

## ✅ CI

GitHub Actions sur PR et push (`main`, `develop`) :
lint → typecheck → tests → builds, puis build des 4 images Docker.

## 🔀 GitFlow

- `main` - Production stable
- `develop` - Intégration/staging
- `feature/*` - Nouvelles fonctionnalités
- `hotfix/*` - Corrections urgentes
- `release/*` - Préparation versions

## 📚 Docs

- [DOCKER.md](DOCKER.md) — builds & environnements Docker
- [CONFIGURATION.md](CONFIGURATION.md) — variables d'environnement
- [TODO.md](TODO.md) — état des chantiers en cours
- `CLAUDE.md` + `.claude/skills/` — conventions de dev (tests, structure, front, perf)
