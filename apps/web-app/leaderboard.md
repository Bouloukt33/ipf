# API — Endpoints créés (session feature/dashboardbureau)

## Auth

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/sync-user` | Synchronise l'utilisateur Auth0 avec la BDD (appelé côté client après login). Alias de `/auth/login`. |

**Correction front :** `api.config.ts` — `/api/sync-user` corrigé en `/auth/sync-user`. `auth.service.ts` — mock supprimé, appel API réel actif.

---

## Dashboard

Tous les endpoints nécessitent un JWT Auth0 (Bearer token).

| Méthode | Route | Retour |
|---------|-------|--------|
| GET | `/dashboard/stats` | Stats globales de l'utilisateur |
| GET | `/dashboard/achievements` | Badges avec progression |
| GET | `/dashboard/streak` | Streak courant + activité 7 jours |

### GET `/dashboard/stats`
```json
[
  { "label": "Sessions jouées",  "target": 42 },
  { "label": "Taux de réussite", "target": 78, "suffix": "%" },
  { "label": "XP total",         "target": 1250 },
  { "label": "Jours de série",   "target": 5, "suffix": " j" }
]
```
> **Note front :** `IStatItem` contient `icon: ReactNode` — ce champ ne peut pas venir de l'API. Le composant doit mapper les icônes localement.

### GET `/dashboard/achievements`
```json
[
  {
    "slug": "first-session",
    "gradient": "from-amber-400 to-orange-500",
    "levelLabel": "Bronze",
    "title": "Première session",
    "progress": 1,
    "progressMax": 1,
    "description": "Complète ta première session",
    "barColor": "bg-amber-400",
    "locked": false
  }
]
```
> **Note front :** `IAchievement` contient `icon: ReactNode` — même remarque, à mapper côté composant.

### GET `/dashboard/streak`
```json
{
  "currentStreak": 5,
  "weekDays": [
    { "label": "L", "status": "done" },
    { "label": "M", "status": "done" },
    { "label": "M", "status": "none" },
    { "label": "J", "status": "done" },
    { "label": "V", "status": "done" },
    { "label": "S", "status": "none" },
    { "label": "D", "status": "today" }
  ]
}
```
Statuts possibles : `"done"` | `"today"` | `"none"`.

---

## Leaderboard

| Méthode | Route | Retour |
|---------|-------|--------|
| GET | `/leaderboard` | Classement global — podium + rows |
| GET | `/leaderboard/podium` | Top 3 uniquement |
| GET | `/leaderboard/:slug` | Classement par catégorie ou thème |

### GET `/leaderboard` et `/leaderboard/:slug`
```json
{
  "podium": [
    { "rank": 1, "initial": "J", "name": "Jean Dupont", "score": "1250 XP", "bg": "from-yellow-400 to-amber-500" },
    { "rank": 2, "initial": "M", "name": "Marie Martin", "score": "980 XP",  "bg": "from-slate-300 to-slate-400" },
    { "rank": 3, "initial": "P", "name": "Paul Durand", "score": "870 XP",  "bg": "from-amber-600 to-amber-700" }
  ],
  "rows": [
    {
      "rk": "4", "hi": false, "initial": "A", "name": "Alice", "handle": "@alice",
      "trend": "eq", "trendVal": "", "score": "750 XP", "bg": "bg-blue-500", "me": false
    }
  ]
}
```

### GET `/leaderboard/podium`
```json
[
  { "rank": 1, "initial": "J", "name": "Jean Dupont", "score": "1250 XP", "bg": "from-yellow-400 to-amber-500" },
  { "rank": 2, "initial": "M", "name": "Marie Martin", "score": "980 XP",  "bg": "from-slate-300 to-slate-400" },
  { "rank": 3, "initial": "P", "name": "Paul Durand", "score": "870 XP",  "bg": "from-amber-600 to-amber-700" }
]
```

**`:slug`** accepte un slug de catégorie (`bail-commercial`) ou de thème (la catégorie parente est retrouvée automatiquement).

Le champ `me: true` est positionné sur l'entrée de l'utilisateur connecté dans `rows`.

**Source des données :** `LeaderboardEntry` — table alimentée automatiquement à chaque fin de session quiz (voir section Quiz ci-dessous).

---

## Progression

| Méthode | Route | Retour |
|---------|-------|--------|
| GET | `/progression` | Toutes les progressions, groupées par mois |
| GET | `/progression/:month` | Progression d'un mois donné (format `YYYY-MM`) |

### GET `/progression`
```json
[
  {
    "id": "2024-03",
    "month": "2024-03",
    "themes": [
      { "name": "Bail commercial", "count": "42 questions", "pct": 78, "stars": 4, "icBg": "", "icSvg": null }
    ]
  }
]
```

### GET `/progression/2024-03`
```json
{
  "id": "2024-03",
  "month": "2024-03",
  "themes": [
    { "name": "Bail commercial", "count": "42 questions", "pct": 78, "stars": 4, "icBg": "", "icSvg": null }
  ]
}
```

**Source des données :** `UserMastery` — table alimentée automatiquement à chaque fin de session quiz.

> **Note front :** `IThemeItem` contient `icSvg: ReactNode` — à mapper côté composant.

---

## Modifications dans quiz.service.ts

À chaque appel de `completeSession()` (fin de session), deux opérations sont maintenant ajoutées **uniquement si c'est la première complétion** (`wasInProgress === true`) :

### 1. Mise à jour de `UserMastery`
- Cherche l'entrée de maîtrise de l'utilisateur pour la catégorie jouée
- Si elle existe : incrémente `questionsSeen`, `correctCount`, recalcule `masteryLevel = correctCount / questionsSeen`
- Si elle n'existe pas : crée l'entrée
- C'est ce qui alimente l'endpoint `GET /progression`

### 2. Mise à jour des `LeaderboardEntry`
- **Leaderboard GLOBAL** : upsert avec `score = xpTotal` de l'utilisateur (toujours croissant)
- **Leaderboard CATÉGORIE** : upsert avec `score = sum(xpEarned)` de toutes les sessions complétées dans cette catégorie
- Les leaderboards sont créés automatiquement s'ils n'existent pas encore en BDD
- Le rang est calculé dynamiquement à la lecture (ORDER BY score DESC, index = rang) — le champ `rank` en BDD vaut `0` (valeur de cache non utilisée)

---

## Structure des fichiers créés

```
apps/api/src/
├── dashboard/
│   ├── dashboard.service.ts
│   ├── dashboard.controller.ts
│   ├── dashboard.module.ts
│   └── index.ts
├── leaderboard/
│   ├── leaderboard.service.ts
│   ├── leaderboard.controller.ts
│   ├── leaderboard.module.ts
│   └── index.ts
└── progression/
    ├── progression.service.ts
    ├── progression.controller.ts
    ├── progression.module.ts
    └── index.ts
```
