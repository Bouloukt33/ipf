# Web App - React 18 + Vite

Application principale pour les apprenants de "5 Secondes Chrono".

## Stack Technique

- **React 18** - UI Library
- **Vite** - Build tool ultra-rapide
- **TypeScript** - Typage statique
- **TanStack Query** - Fetching & cache
- **Zustand** - State management léger
- **React Router v6** - Routing
- **Tailwind CSS** - Styling responsive
- **@auth0/auth0-react** - Authentification

## Structure

```
src/
├── components/       # Composants réutilisables
├── pages/           # Pages de l'application
│   ├── Home/
│   ├── Quiz/
│   ├── QuizVideo/
│   ├── Coaching/
│   ├── Progression/
│   └── Profile/
├── hooks/           # Custom hooks
├── services/        # API calls
├── stores/          # Zustand stores
├── utils/           # Utilitaires
└── types/           # Types TypeScript
```

## Pages (selon rôles)

| Page | Visiteur | Apprenti | Compagnon | Réussite |
|------|----------|----------|-----------|----------|
| Demo Quiz | ✅ | ✅ | ✅ | ✅ |
| Quiz illimités | ❌ | ✅ | ✅ | ✅ |
| Quiz + Vidéos | ❌ | ❌ | ✅ | ✅ |
| Coaching IA | ❌ | ❌ | ❌ | ✅ |
| Progression | ❌ | ✅ | ✅ | ✅ |

## Scripts

```bash
pnpm dev      # Développement
pnpm build    # Build production
pnpm preview  # Preview build
pnpm lint     # Linting
pnpm test     # Tests
```
