# Testing Utilities

Utilitaires de test partagés pour "5 Secondes Chrono".

## Stack Technique

- **Vitest** - Test runner (apps React/Vite)
- **Jest** - Test runner (NestJS)
- **Testing Library** - Tests composants React
- **MSW** - Mock Service Worker (API mocking)
- **Playwright** - Tests E2E

## Contenu

### Fixtures

```typescript
// fixtures/users.ts
export const mockVisitor: User = { ... };
export const mockApprenti: User = { ... };
export const mockCompagnon: User = { ... };
export const mockReussite: User = { ... };
export const mockAdmin: User = { ... };

// fixtures/questions.ts
export const mockQuestions: Question[] = [ ... ];

// fixtures/subscriptions.ts
export const mockSubscriptions: Subscription[] = [ ... ];
```

### Mocks

```typescript
// mocks/auth0.ts
export const mockAuth0Provider = { ... };
export const mockUseAuth0 = { ... };

// mocks/api.ts
export const handlers = [
  rest.get('/api/quiz/questions', ...),
  rest.post('/api/quiz/answer', ...),
];
```

### Helpers

```typescript
// helpers/render.tsx
export function renderWithProviders(ui: ReactElement, options?: RenderOptions);

// helpers/wait.ts
export function waitForLoadingToFinish(): Promise<void>;

// helpers/auth.ts
export function mockAuthenticated(role: UserRole): void;
```

## Utilisation

```typescript
import { mockApprenti, renderWithProviders } from '@ipf/testing';

test('affiche le quiz pour un apprenti', () => {
  mockAuthenticated('apprenti');
  renderWithProviders(<QuizPage />);
  // ...
});
```

## Scripts

```bash
npm run test           # Tous les tests
npm run test:unit      # Tests unitaires
npm run test:e2e       # Tests E2E Playwright
npm run test:coverage  # Couverture
```
