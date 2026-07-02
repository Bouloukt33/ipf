---
name: frontend-design
description: Design system et animations IPF — tokens Tailwind, patterns Radix, micro-interactions du quiz (timer 5 s, feedback réponse, streak, level-up), animations performantes et accessibles. À lire avant tout travail UI sur web-app, web-admin ou landing.
---

# Front moderne & animé — conventions IPF

## Identité

Produit d'apprentissage gamifié : l'UI doit être **vive, réactive,
encourageante** — sans jamais ralentir la boucle de jeu (5 s par question).
Langue UI : français. Ton : professionnel chaleureux (utilisateurs = pros de
l'immobilier, pas des gamers).

## Design system

- **Tailwind + tokens du projet** : réutiliser les couleurs déjà déclarées dans
  `tailwind.config.ts` de l'app (ex. `charcoal`, accent orange `#D27A2D` côté
  data-viz). Ne JAMAIS hardcoder une couleur hex dans un composant — l'ajouter
  au config si elle manque.
- **Primitives** : Radix UI (`react-label`, `react-select`, `react-slot`) +
  CVA pour les variants (pattern `components/ui/button.tsx` de web-app).
  Étendre les variants CVA existants plutôt que créer un bouton parallèle.
- **Icônes** : lucide-react uniquement.
- **Composants utilisés par ≥2 apps** : destination `packages/ui` (à amorcer),
  en attendant, signaler la duplication en commentaire `// TODO(ui-package)`.

## Animations — règles de performance

1. **N'animer QUE `transform` et `opacity`** (compositeur GPU). Jamais
   `width/height/top/left/margin` (layout) ni `box-shadow` brut (paint) —
   pour une ombre animée, animer l'opacité d'un pseudo-élément.
2. **Durées** : micro-feedback 100–200 ms, transitions d'écran 200–300 ms,
   célébrations (level-up, badge) 400–600 ms max. Easing `ease-out` pour les
   entrées, `ease-in` pour les sorties.
3. **Tailwind d'abord** (`transition`, `animate-*`, `tailwindcss-animate` est
   installé). **framer-motion** seulement pour l'orchestration complexe
   (stagger, layout animations, presence) — import ciblé :
   `import { motion, AnimatePresence } from 'framer-motion'` et composants
   client uniquement (`'use client'`).
4. **`prefers-reduced-motion` obligatoire** pour toute animation non triviale :
   utilitaires `motion-safe:`/`motion-reduce:` de Tailwind, ou
   `useReducedMotion()` de framer-motion. Une célébration doit avoir un
   équivalent statique.
5. Pas d'animation en boucle infinie hors états de chargement.

## Micro-interactions du quiz (boucle cœur)

- **Timer 5 s** : barre/anneau animé par `transform: scaleX` piloté par le
  temps serveur (`questionServedAt`) — jamais un simple setTimeout visuel
  désynchronisé. Derniers 40 % en couleur d'alerte.
- **Réponse** : feedback < 100 ms au clic (scale 0.97 + retour), puis état
  correct/incorrect (vert/rouge + shake léger ≤ 200 ms sur l'erreur).
- **XP/combo** : compteur incrémental animé (`+13 XP` flottant), multiplier
  visible dès combo ≥ 2.
- **Streak/level-up** : célébration `AnimatePresence` (scale + fade),
  respectant reduced-motion.

## Accessibilité (non négociable)

- Contraste AA minimum ; jamais la couleur seule pour l'état (✓/✗ + texte).
- Focus visible sur tout interactif ; le quiz doit être jouable au clavier
  (réponses = boutons, pas des divs cliquables).
- `aria-live="polite"` pour les annonces de score/résultat.
- Images : `alt` systématique ; icônes décoratives `aria-hidden`.

## Next.js spécifique (web-app, landing)

- Composants **Server par défaut** ; `'use client'` uniquement si état/effets/
  handlers. Pousser la frontière client le plus bas possible dans l'arbre.
- Images : `next/image` obligatoire (des `<img>` hérités existent — les migrer
  quand on touche au fichier ; le lint les signale en warning).
- Landing : rester statique/SSG, zéro JS client superflu — c'est la page SEO.
