# UI - Design System

Bibliothèque de composants React partagés pour "5 Secondes Chrono".

## Stack Technique

- **React 18** - UI Library
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Radix UI** - Composants accessibles headless
- **Class Variance Authority (CVA)** - Variants de composants
- **Storybook** - Documentation composants

## Composants

### Layout
- `Container` - Conteneur responsive
- `Card` - Carte avec variants
- `Modal` - Fenêtre modale
- `Sidebar` - Barre latérale

### Forms
- `Button` - Boutons avec variants
- `Input` - Champs de saisie
- `Select` - Sélection
- `Checkbox` - Cases à cocher
- `Radio` - Boutons radio

### Quiz
- `QuizTimer` - Timer 5 secondes (configurable)
- `QuizCard` - Carte question
- `QuizOption` - Option de réponse
- `QuizProgress` - Barre de progression
- `QuizResult` - Affichage résultat

### Feedback
- `Badge` - Badges (points, niveaux)
- `Toast` - Notifications
- `Alert` - Messages d'alerte
- `Spinner` - Loading state

### Navigation
- `Navbar` - Barre de navigation
- `Tabs` - Onglets
- `Breadcrumb` - Fil d'Ariane

## Utilisation

```tsx
import { Button, QuizTimer, Card } from '@ipf/ui';

<Card>
  <QuizTimer duration={5} onTimeout={handleTimeout} />
  <Button variant="primary">Valider</Button>
</Card>
```

## Scripts

```bash
pnpm dev        # Storybook dev
pnpm build      # Build library
pnpm storybook  # Storybook
pnpm lint       # Linting
```
