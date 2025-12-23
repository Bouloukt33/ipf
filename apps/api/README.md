# Backend API - NestJS

API REST/GraphQL pour "5 Secondes Chrono".

## Stack Technique

- **NestJS** - Framework Node.js
- **TypeScript** - Typage statique
- **Prisma** - ORM
- **PostgreSQL** - Base de données principale
- **Redis** - Cache & sessions
- **GraphQL** - API flexible (optionnel)
- **Swagger** - Documentation API auto-générée
- **express-oauth2-jwt-bearer** - Validation JWT Auth0

## Modules

```
src/
├── auth/           # Intégration Auth0, guards, rôles
├── users/          # Gestion utilisateurs & profils
├── subscriptions/  # Abonnements (Apprenti/Compagnon/Réussite)
├── quiz/           # Questions, sessions, résultats
├── videos/         # Vidéos pédagogiques
├── payments/       # Intégration Stripe, webhooks
├── coaching/       # Interface avec AI Service
├── analytics/      # Statistiques & rapports
└── common/         # Guards, pipes, interceptors
```

## Base de Données (Prisma)

```prisma
model User { ... }
model Subscription { ... }
model Question { ... }
model Video { ... }
model QuizResult { ... }
model Payment { ... }
```

## Endpoints Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/quiz/questions | Liste questions (filtrable) |
| POST | /api/quiz/sessions | Démarrer session quiz |
| POST | /api/quiz/answer | Soumettre réponse |
| GET | /api/videos | Liste vidéos |
| GET | /api/users/progress | Progression utilisateur |
| POST | /api/payments/webhook | Webhook Stripe |

## Scripts

```bash
pnpm dev      # Développement (watch)
pnpm build    # Build production
pnpm start    # Démarrer serveur
pnpm migrate  # Migrations Prisma
pnpm seed     # Seed database
pnpm test     # Tests
```
