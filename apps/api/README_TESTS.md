# 🧪 Tests Automatisés - IPF API

## ⚡ Quick Start

```bash
# Installer les dépendances (si ce n'est pas déjà fait)
npm install

# Lancer tous les tests
npm test

# Voir le résumé visuel
./test-summary.sh

# Coverage détaillé
npm run test:cov
```

---

## 📊 Résultats Actuels

```
╔════════════════════════════════════════════╗
║  Test Suites: 8 passed                    ║
║  Tests:       46 passed                    ║
║  Time:        ~0.5s                        ║
║  Coverage:    ~60% (Services: 80%+)        ║
╚════════════════════════════════════════════╝
```

---

## 📁 Fichiers de Tests

### Tests Unitaires (`.spec.ts`)

| Fichier | Tests | Coverage | Description |
|---------|-------|----------|-------------|
| `auth/permissions.guard.spec.ts` | 7 | 100% | Guard RBAC |
| `profile/profile.service.spec.ts` | 5 | 77.77% | Gestion profils |
| `quiz/quiz.service.spec.ts` | 8 | 84.09% | Sessions quiz |
| `questions/questions.service.spec.ts` | 10 | 90.9% | CRUD questions |
| `users/users.service.spec.ts` | 5 | 83.87% | Gestion users |
| `admin/admin.service.spec.ts` | 3 | 85.71% | Dashboard admin |
| `categories/categories.service.spec.ts` | 7 | 94.73% | Catégories |

### Tests E2E (`.e2e-spec.ts`)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `test/auth.e2e-spec.ts` | 3 | Routes protégées |
| `test/categories.e2e-spec.ts` | 4 | Routes publiques |

---

## 🎯 Ce qui est Testé

### ✅ Sécurité
- Permissions RBAC (read:quiz, write:questions, manage:users)
- AuthGuard et PermissionsGuard
- Blocage accès sans token (401)
- Blocage accès sans permissions (403)

### ✅ Logique Métier
- Calcul XP selon vitesse (15/12/10/8 points)
- Validation réponses quiz
- Mise à jour incrémentale (score, XP)
- Statistiques dashboard

### ✅ CRUD Complet
- Create, Read, Update, Delete
- Pagination (page, limit)
- Filtrage (category, level, role)
- Toggle activation

### ✅ Gestion d'Erreurs
- NotFoundException (ressources inexistantes)
- BadRequestException (données invalides)
- ForbiddenException (permissions insuffisantes)

---

## 🚀 Commandes Disponibles

### Tests Unitaires

```bash
# Tous les tests
npm test

# Mode watch (redémarre auto)
npm run test:watch

# Coverage complet
npm run test:cov

# Test spécifique
npm test -- quiz.service.spec
```

### Tests E2E

```bash
# Tous les E2E
npm run test:e2e

# E2E spécifique
npm run test:e2e -- auth.e2e-spec
```

### Scripts Utiles

```bash
# Résumé visuel des tests
./test-summary.sh

# Coverage HTML (ouvrir dans navigateur)
npm run test:cov
open coverage/lcov-report/index.html
```

---

## 📈 Coverage par Module

```
Service              Coverage    Status
─────────────────────────────────────────
PermissionsGuard     100.0%      🟢 Excellent
CategoriesService     94.73%     🟢 Excellent
QuestionsService      90.9%      🟢 Excellent
AdminService          85.71%     🟢 Très bon
QuizService           84.09%     🟢 Très bon
UsersService          83.87%     🟢 Très bon
ProfileService        77.77%     🟡 Bon
```

---

## 🔍 Exemple de Test

### Test Unitaire avec Mock

```typescript
describe('QuizService', () => {
  it('should award correct XP based on response time', async () => {
    const mockSession = { 
      id: 'session-1', 
      status: 'IN_PROGRESS' 
    };
    const mockQuestion = { 
      id: 'q1', 
      correctAnswer: 'A' 
    };

    mockPrisma.quizSession.findUnique.mockResolvedValue(mockSession);
    mockPrisma.question.findUnique.mockResolvedValue(mockQuestion);

    const result = await service.submitAnswer(
      'session-1', 
      'q1', 
      'A', 
      2000  // 2 secondes
    );

    expect(result.isCorrect).toBe(true);
    expect(result.xpEarned).toBe(15); // Bonus vitesse
  });
});
```

### Test E2E avec Supertest

```typescript
describe('CategoriesController (e2e)', () => {
  it('GET /api/categories - Should return all categories', () => {
    return request(app.getHttpServer())
      .get('/api/categories')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });
});
```

---

## 📚 Documentation

- **TESTING_GUIDE.md** - Guide complet et détaillé
- **TESTS_SUMMARY.md** - Résumé exhaustif des tests
- **POSTMAN_GUIDE.md** - Tests manuels avec Postman

---

## 🎯 Prochaines Étapes

### À Implémenter

- [ ] Tests Controllers (actuellement 0%)
- [ ] Tests E2E avec token Auth0 réel
- [ ] Tests d'intégration Prisma
- [ ] Tests JWT Strategy
- [ ] Tests de performance (load testing)

### Coverage à Améliorer

- [ ] Controllers : 0% → 80%
- [ ] JWT Strategy : 53% → 80%
- [ ] Global : 60% → 80%

---

## 🐛 Dépannage

### Erreur : Cannot find module

```bash
npm install
npx prisma generate
```

### Tests trop lents

```bash
# Utiliser --maxWorkers
npm test -- --maxWorkers=4
```

### Coverage incomplet

```bash
# Voir les fichiers non couverts
npm run test:cov
cat coverage/lcov-report/index.html
```

---

## ✅ Validation Avant Commit

```bash
# Lancer tous les tests
npm test

# Vérifier coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# ✅ Si tout passe, vous pouvez commit !
git add .
git commit -m "feat: add automated tests"
```

---

## 🎉 Résultat Final

```
✓ 46 tests créés
✓ 8 test suites
✓ Coverage services: 80%+
✓ Temps exécution: <1s
✓ 0 test en échec
```

**Tests prêts pour l'intégration continue !** 🚀

---

*Dernière mise à jour: 2026-01-19*
