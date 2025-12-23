# Admin Dashboard - React 18 + Vite

Tableau de bord administrateur pour "5 Secondes Chrono".

## Stack Technique

- **React 18** - UI Library
- **Vite** - Build tool
- **TypeScript** - Typage statique
- **TanStack Query** - Fetching & cache
- **TanStack Table** - Tableaux de données
- **Zustand** - State management
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Graphiques
- **@auth0/auth0-react** - Authentification (rôle Admin)

## Pages Admin

```
src/pages/
├── Dashboard/           # Vue d'ensemble, KPIs
├── Statistiques/        # Analytics détaillées
├── Questions/           # CRUD questions quiz
├── Videos/              # CRUD vidéos pédagogiques
├── Outils/              # Gestion outils
├── Abonnes/             # Liste & fiches abonnés
├── AccesQuiz/           # Gestion accès Apprenti
├── AccesQuizVideo/      # Gestion accès Compagnon
├── Encaissements/       # Paiements & Stripe
└── CoachingIA/          # Config simulateur IA
```

## Fonctionnalités

- ✅ Dashboard avec graphiques temps réel
- ✅ CRUD complet questions/vidéos
- ✅ Gestion utilisateurs & abonnements
- ✅ Rapports financiers
- ✅ Configuration coaching IA
- ✅ Export données (CSV, PDF)

## Scripts

```bash
pnpm dev      # Développement
pnpm build    # Build production
pnpm preview  # Preview build
pnpm lint     # Linting
```
