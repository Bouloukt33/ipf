# 📘 Frontend — Architecture & Fonctionnement

> Stack : **Next.js 14 (App Router)** · **TypeScript** · **Tailwind CSS** · **Zustand** · **Auth0**

---

## 🗂️ Structure des dossiers

```
src/
├── app/                   # Routes Next.js (App Router)
├── components/            # Composants React réutilisables
├── data/                  # Données statiques / mock
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires, config, types
├── services/              # 🆕 Appels API par fonctionnalité
├── store/                 # État global (Zustand)
└── middleware.ts          # Middleware Next.js (auth, redirects)
```

---

## 🔀 Routing — App Router Next.js

| Route | Fichier | Accès |
|---|---|---|
| `/` | `app/page.tsx` | Public — landing page |
| `/login` | `app/(auth)/login/` | Public |
| `/register` | `app/(auth)/register/` | Public |
| `/auth/post-login` | `app/auth/post-login/` | Auth0 callback |
| `/dashboard` | `app/dashboard/page.tsx` | Privé |
| `/dashboard/progression` | `app/dashboard/progression/` | Privé |

Le groupe `(auth)` est un **Route Group** Next.js : il regroupe les pages sans ajouter de segment dans l'URL.

---

## 🔐 Authentification — Auth0

L'auth repose sur **Auth0** via le SDK `@auth0/nextjs-auth0`.

### Flux de connexion

```
Utilisateur clique "Login"
  → LoginButton.tsx
    → Redirection Auth0
      → Auth0 callback → /auth/post-login
        → POST /api/sync-user  (synchronisation BDD)
          → Zustand store mis à jour
            → Redirection /dashboard
```

### Fichiers clés

| Fichier | Rôle |
|---|---|
| `lib/auth0.ts` | Configuration du client Auth0 |
| `lib/auth.api.ts` | Helpers pour récupérer session / token côté serveur |
| `components/AuthProvider.tsx` | Fournit le contexte Auth0 à tout l'arbre React |
| `components/LoginButton.tsx` | Bouton de connexion |
| `components/LogoutButton.tsx` | Bouton de déconnexion |
| `components/UserMenu.tsx` | Menu utilisateur connecté |
| `middleware.ts` | Protège les routes privées, redirige si non authentifié |

### Middleware

`middleware.ts` intercepte toutes les requêtes et redirige les utilisateurs non connectés tentant d'accéder aux routes `/dashboard/*` vers `/login`.

---

## 🗃️ État global — Zustand

Le store Zustand est défini dans `store/auth.store.ts`.

```ts
// Exemple d'utilisation dans un composant
import { useAuthStore } from '@/store/auth.store';

const { user, setUser, clearUser } = useAuthStore();
```

### Pourquoi Zustand ?

- Pas de boilerplate (pas de Provider à wrapper)
- API simple basée sur des hooks
- Sélecteurs natifs pour éviter les re-renders inutiles

---

## 🌐 Appels API — Architecture centralisée

### Point de sortie unique : `src/lib/api.config.ts`

**Tous les appels HTTP passent par ce fichier.** Il centralise :
- Le `API_BASE_URL` (via variable d'env `NEXT_PUBLIC_API_URL`)
- Tous les endpoints sous `API_ENDPOINTS`
- Le wrapper `apiFetch` qui gère automatiquement les headers, le token Bearer et les erreurs

```ts
// src/lib/api.config.ts
export const API_ENDPOINTS = {
  auth: { syncUser: '/api/sync-user', me: '/auth/me' },
  progression: { list: '/progression', byMonth: (m) => `/progression/${m}` },
  leaderboard: { global: '/leaderboard', byTheme: (t) => `/leaderboard/${t}` },
};
```

### Services par fonctionnalité : `src/services/`

Chaque fichier regroupe les appels API d'un domaine métier et **importe uniquement depuis `api.config.ts`**.

```
src/services/
├── auth.service.ts          # syncUser, getMe
├── progression.service.ts   # getProgression, updateProgression
└── leaderboard.service.ts   # getLeaderboard, getLeaderboardByTheme
```

#### Exemple d'appel dans un composant

```ts
import { getProgression } from '@/services/progression.service';
import { useAuthStore } from '@/store/auth.store';

const { token } = useAuthStore();
const data = await getProgression(token);
```

#### Règle : ne jamais appeler `fetch` directement dans un composant

```ts
// ❌ Mauvaise pratique
const res = await fetch('http://localhost:3001/progression', { ... });

// ✅ Bonne pratique
import { getProgression } from '@/services/progression.service';
const data = await getProgression(token);
```

---

## 🧩 Composants

### Layout & Navigation

| Composant | Rôle |
|---|---|
| `Navbar.tsx` | Barre de navigation principale |
| `Footer.tsx` | Pied de page |
| `components/user/sidebar/` | Sidebar du dashboard |

### Landing Page

| Composant | Rôle |
|---|---|
| `Hero.tsx` | Section hero de la page d'accueil |
| `Features.tsx` | Section fonctionnalités |
| `Pricing.tsx` | Section tarifs |

### UI primitives (`components/ui/`)

Composants de base réutilisables : `button.tsx`, `input.tsx`, `label.tsx`, `divider.tsx`, `navbutton.tsx`, `badges/`, `icons/`.

---

## 🪝 Hooks personnalisés

| Hook | Fichier | Rôle |
|---|---|---|
| `useSidebar` | `hooks/useSidebar.ts` | Gère l'état ouvert/fermé de la sidebar |

---

## 📦 Données statiques (`src/data/`)

| Fichier | Contenu |
|---|---|
| `leaderboard.ts` | Données mock du classement |
| `months.ts` | Liste des mois |
| `progressionData.tsx` | Données de progression (mock/static) |
| `themes.tsx` | Définition des thèmes disponibles |

---

## ⚙️ Configuration

### Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://xxx.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
```

### Tailwind

La configuration Tailwind est dans `tailwind.config.ts`.  
Seules les classes **core Tailwind** sont utilisées (pas de plugin custom non compilé).

---

## 📐 Conventions

- **Nommage** : composants en `PascalCase`, hooks en `camelCase` préfixés `use`
- **Imports** : utiliser les alias `@/` (configuré dans `tsconfig.json`)
- **API** : toujours passer par `src/services/` → `src/lib/api.config.ts`
- **État global** : Zustand uniquement, pas de Context API pour l'état métier
- **Types** : définis dans `lib/type.ts` pour les types partagés