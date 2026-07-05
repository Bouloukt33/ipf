# IPF — Ce qui reste à faire

État au 29 mai 2026. Ce fichier liste les points incomplets ou à aligner avec le besoin défini.

---

## 📦 Packs

### Associer des questions depuis l'UI
**Statut : API OK, interface manquante**

Le endpoint `POST /packs/:id/questions` existe mais il n'y a aucune interface admin pour l'utiliser.
- `PackModal` gère les propriétés du pack (nom, slug, catégorie, prix…) mais **aucun sélecteur de questions**
- La page `/admin/packs` affiche le nombre de questions en lecture seule
- **À faire** : ajouter un onglet ou une section dans le modal pour ajouter/retirer des questions d'un pack (multi-select depuis les questions de la catégorie)

### QuestionModal — packId en texte libre
**Statut : input texte brut, sans validation**

Le champ Pack dans `QuestionModal.tsx` (ligne 350) est un simple `<input type="text">`.
- L'utilisateur doit saisir l'ID manuellement — erreur possible
- **À faire** : remplacer par un `<select>` qui charge les packs via `GET /packs?categoryId=xxx&includeInactive=true`

### QuestionRow — affiche l'ID brut du pack
**Statut : non lisible**

La colonne Pack dans `QuestionRow.tsx` (ligne 141) affiche `question.packId` tel quel (ex: `cm8abc123`).
- **À faire** : afficher le nom ou le slug du pack — nécessite de passer les packs en prop ou de les résoudre côté hook

### QuestionFilters — aucun filtre par pack
**Statut : absent**

Il n'y a pas de filtre "Pack" dans la barre de filtres des questions.
- **À faire** : ajouter un `<select>` alimenté par `GET /packs?includeInactive=true`

### Pack VISITEUR — onboarding non lié
**Statut : pack créé en base, pas utilisé dans le flow**

`/quiz/onboarding/page.tsx` sauvegarde les préférences métier puis redirige vers `/quiz/selection`. Il ne charge pas le pack VISITEUR ni ne démarre un quiz avec lui.
- **À faire** : après la complétion de l'onboarding, rediriger vers `/quiz?packId=<id-pack-visiteur>` ou afficher le pack VISITEUR comme premier contenu recommandé

---

## 🗂️ Catégories / Types de baux

### QuestionModal — catégories hardcodées
**Statut : désynchronisé de la base**

`QuestionModal.tsx` (lignes 49–55) contient un tableau `CATEGORIES` en dur avec des IDs `cat-1` à `cat-5` qui n'existent pas en base. Le sélecteur de catégorie dans le modal ne charge **rien depuis l'API**.
- **À faire** : supprimer le tableau hardcodé, passer les vraies catégories depuis `useQuestions` (qui charge déjà `categories`) et les injecter dans `QuestionModal` via une prop

### LEASE_TYPE_LABELS — incohérence de modèle
**Statut : données fantômes**

`question.types.ts` définit `LeaseType = 'COM' | 'PRO' | 'DER' | 'FON' | 'HAB' | 'AGR' | 'RUR'` avec des labels correspondants.
Ces codes **n'existent pas dans la base de données** — les vraies catégories ont des slugs comme `bail-commercial`, `bail-professionnel`, etc.
- Le champ `leaseType` dans `IQuestionFormData` utilise ces codes fictifs
- **À faire** : aligner le modèle frontend — remplacer `leaseType: LeaseType` par `categoryId: string` et utiliser le nom/slug des catégories réelles. Cela touche `QuestionModal`, `QuestionRow`, `QuestionFilters`, `question.types.ts` et `questionsService`

---

## 📊 Analytics utilisateurs

### Niveau "paramétrable"
**Statut : affiché mais pas paramétrable**

Dans la spec initiale, le niveau utilisateur était décrit comme "paramétrable". Actuellement on affiche `profile.level` (calculé en base), mais il n'y a pas d'interface admin pour ajuster le niveau d'un utilisateur ou configurer les seuils de niveau.
- **À clarifier** : qu'est-ce qui doit être paramétrable ? Les seuils XP par niveau ? Le niveau manuel ?

### Fréquence de connexion réelle
**Statut : non implémentable sans tracking Auth0**

La demande mentionne "quand connecté, quand déconnecté, durée de connexion". Ces données ne sont pas stockées en base — seul `lastPlayedAt` sur `UserProfile` existe. La durée affichée dans les analytics est la **durée des sessions quiz**, pas la durée de connexion à l'application.
- **À faire si besoin** : brancher les logs Auth0 (Auth0 Actions ou Management API) pour stocker les événements de connexion

---

## 💳 Abonnements / Monétisation

### Envoi d'emails programmé (scheduled)
**Statut : envoi manuel OK, programmation absente**

On peut envoyer des emails manuellement depuis `/admin/emails` et `/admin/prospects`. Mais il n'y a pas de système de **programmation d'envoi** (ex: "envoyer cet email dans 3 jours", "envoyer tous les lundis").
- **À faire** : utiliser `@nestjs/schedule` (pas encore installé) pour des crons configurables, ou stocker des "scheduled sends" en base

### Config SMTP non branchée
**Statut : nodemailer installé, credentials manquants**

Voir `CONFIGURATION.md`. Sans les variables `MAILER_HOST / MAILER_USER / MAILER_PASS` dans `apps/api/.env`, les emails ne partent pas (ils sont loggés en console).
- **À faire** : créer un compte SendGrid ou Resend et renseigner le `.env`

### Stripe non intégré
**Statut : champs réservés dans le schema, aucun code**

Les champs `Plan.stripePriceId`, `Subscription.stripeSubscriptionId`, `Subscription.stripeCustomerId` sont présents dans le schema Prisma mais aucune logique Stripe n'est implémentée (pas de checkout, pas de webhook, pas de portal).
- **À faire en phase 2** : installer `stripe`, créer `StripeModule`, implémenter checkout + webhook

### Point "besoin client" — à définir
**Statut : en attente RDV**

*"A demander : besoin client ??? (Client20260503 : nous échangerons lors de notre prochain RDV sur ce point précis)"*
Ce point de la spec initiale n'a pas encore été défini. À traiter lors du prochain RDV.

---

## ⚙️ Infrastructure / Build

### Junction `.prisma` fragile
**Statut : ✅ Résolu (migration npm workspaces, juillet 2026)**

Le client Prisma est désormais généré dans le `node_modules` racine (`output = "../../../node_modules/.prisma/client"` dans le schema) et `apps/api` a un script `postinstall: prisma generate`. Plus de junction manuelle.

### Gestionnaire de paquets — pnpm/npm mélangés
**Statut : ✅ Résolu (migration npm workspaces, juillet 2026)**

Le repo est passé à **npm workspaces** exclusivement : un seul `package-lock.json` à la racine, plus aucun `pnpm-lock.yaml`. Toujours lancer `npm install` depuis la racine du monorepo.

---

## 🔢 Récap par priorité

| Priorité | Item | Effort | Statut |
|----------|------|--------|--------|
| ✅ Fait | Catégories réelles dans QuestionModal | Moyen | Terminé |
| ✅ Fait | PackId → dropdown packs dans QuestionModal | Faible | Terminé |
| ✅ Fait | Interface association questions ↔ pack | Moyen | Terminé (onglet Questions dans PackModal) |
| ✅ Fait | Pack VISITEUR lié à l'onboarding | Faible | Terminé (démarre quiz VISITEUR après onboarding) |
| ✅ Fait | QuestionRow → nom pack au lieu de l'ID | Faible | Terminé |
| 🔴 Haute | Config SMTP (SendGrid/Resend) | Faible | En attente credentials |
| 🟡 Moyenne | LEASE_TYPE_LABELS → alignement modèle réel | Fort | Refactor profond — voir ci-dessus |
| 🟡 Moyenne | postinstall prisma generate dans package.json | Faible | Voir Infrastructure |
| 🟢 Basse | Envoi emails programmé (cron) | Moyen | — |
| 🟢 Basse | Stripe intégration (phase 2) | Fort | — |
| 🟢 Basse | Filtre par pack dans questions | Faible | — |
| ⚪ En attente | Besoin client — point RDV 2026-05-03 | ? | — |
| ⚪ En attente | Niveau "paramétrable" — à clarifier | ? | — |
