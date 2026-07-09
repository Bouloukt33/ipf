---
name: green-it-performance
description: Performance et sobriété numérique (green IT) pour IPF — budgets bundle/LCP, code-splitting, images, chasse aux re-renders React, N+1 Prisma et select minimal, cache Redis, poids des payloads. À lire avant toute feature front ou endpoint, et quand un bundle/une requête semble lourd.
---

# Green IT & Performance — conventions IPF

Principe : **la feature la plus verte est celle qui ne transfère pas, ne
calcule pas, ne re-render pas.** Chaque octet évité = énergie + latence + coût
serveur économisés. La perf est un critère de done, pas une optimisation future.

## Budgets (à vérifier, pas à deviner)

| Cible | Budget | Mesure |
|---|---|---|
| First Load JS (web-app, par route) | ≤ 150 kB | sortie de `next build` |
| Bundle web-admin (gzip) | ≤ 300 kB par chunk | sortie de `vite build` |
| Réponse API (listes) | ≤ 100 kB → paginer | DevTools / curl |
| LCP | < 2,5 s | Lighthouse |
| Requêtes SQL par endpoint | O(1) — jamais O(n) | logs Prisma en dev |

⚠️ État connu : le bundle web-admin est à ~860 kB (recharts non splitté) —
ne pas aggraver, réduire à l'occasion (lazy `React.lazy` sur les pages à charts).

## Frontend

1. **Code-splitting** : pages admin → `React.lazy` + `Suspense` ;
   web-app → `next/dynamic` pour tout composant lourd non critique
   (charts, célébrations, modals). recharts ne doit JAMAIS être dans le
   bundle initial d'une page qui n'affiche pas de graphe.
2. **Images** : `next/image` (AVIF/WebP auto) ; hors Next : dimensions fixes +
   `loading="lazy"` + format moderne. Pas de PNG > 100 kB dans `public/`.
3. **Re-renders** : état au plus près du consommateur ; sélecteurs Zustand
   fins (`useStore(s => s.collapsed)`, jamais l'objet entier) ; `memo`/
   `useMemo` seulement après constat (React DevTools Profiler), pas par réflexe.
4. **Timers du quiz** : une seule source (`requestAnimationFrame` ou interval
   unique), nettoyée au démontage — pas un setInterval par composant.
5. **Polling interdit** par défaut — préférer refetch sur action/focus.
6. Dépendances : avant d'ajouter un package, vérifier le coût (bundlephobia)
   et s'il n'existe pas déjà un équivalent dans le repo.

## API / Base de données

1. **`select` minimal systématique** : jamais d'entité Prisma complète quand
   3 champs suffisent (le pattern `select: { id: true }` est déjà la norme
   dans `quiz.service.ts` — s'y tenir).
2. **N+1 interdit** : boucle de `findUnique` → un `findMany({ where: { id: { in } } })`
   ou `include`. Compteurs → `_count`, agrégats → `groupBy` (pas de calcul en JS
   sur des lignes complètes).
3. **Cache Redis** pour les lectures chaudes et coûteuses : leaderboards,
   stats dashboard, catégories (TTL 60–300 s, invalidation à l'écriture).
4. **Pagination obligatoire** sur toute liste non bornée (pattern
   `{ data, meta }` existant).
5. Réponses : ne renvoyer que ce que le front consomme — pas de "on renvoie
   tout au cas où".

## Docker / infra (déjà en place, à préserver)

- Multi-stage + standalone Next = images minimales ; ne pas ajouter de COPY
  superflu ni de deps de dev dans les runners.
- `NODE_ENV=production` en prod (logs réduits, pas de Swagger).

## Réflexe de fin de tâche

Après une feature front : relire la taille de route dans la sortie
`next build` / `vite build` et comparer au budget. Après un endpoint :
compter les requêtes SQL déclenchées (logs Prisma) sur un appel.
Si un budget explose → corriger avant de livrer, ou le documenter avec un
TODO daté et une raison.
