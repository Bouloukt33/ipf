# 5 Secondes Chrono - IPF

Application web responsive de quiz immobilier pour Le Carré PRO.

> "5 secondes pour répondre, 5 minutes pour apprendre"

## 🎯 Concept

Plateforme d'apprentissage basée sur les neurosciences pour les professionnels de l'immobilier d'entreprise (baux commerciaux, professionnels, dérogatoires).

## 📁 Structure Monorepo (pnpm workspaces)

```
ipf/
├── apps/
│   ├── web-app/      # Application apprenant (React + Vite)
│   ├── web-admin/    # Dashboard administrateur (React + Vite)
│   ├── landing/      # Site vitrine SEO (Next.js SSG)
│   └── api/          # Backend API (NestJS + Prisma)
├── packages/
│   ├── shared/       # Types TypeScript partagés
│   ├── ui/           # Design System (Tailwind + Radix UI)
│   ├── ai-models/    # Modèles IA coaching (Python)
│   └── testing/      # Utils de test partagés
```

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
| Frontend Apps | React 18, Vite, TypeScript, Tailwind CSS |
| Landing | Next.js 14 SSG |
| State | Zustand, TanStack Query |
| Backend | NestJS, Prisma, PostgreSQL, Redis |
| Auth | Auth0 (OAuth2/JWT, RBAC) |
| Paiements | Stripe |
| IA | Python FastAPI, TensorFlow |
| CDN | Cloudflare (vidéos) |

## 🔀 GitFlow

- `main` - Production stable
- `develop` - Intégration/staging
- `feature/*` - Nouvelles fonctionnalités
- `hotfix/*` - Corrections urgentes
- `release/*` - Préparation versions

## 🚀 Démarrage

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build
pnpm build

# Tests
pnpm test
```

## 📦 Scripts Workspaces

```bash
pnpm --filter web-app dev      # Dev web-app
pnpm --filter web-admin dev    # Dev admin
pnpm --filter landing dev      # Dev landing
pnpm --filter api dev          # Dev API
```

