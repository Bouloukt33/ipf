# 📋 Guide de Test de l'API IPF avec Postman

## 🚀 Configuration Initiale

### 1. Importer la Collection

1. Ouvrez Postman
2. Cliquez sur **Import**
3. Sélectionnez le fichier `IPF_API.postman_collection.json`
4. La collection sera importée avec toutes les routes

### 2. Configurer les Variables

Après l'importation, configurez les variables de collection :

1. Cliquez sur la collection **IPF - 5 Secondes Chrono API**
2. Onglet **Variables**
3. Modifiez les valeurs :

| Variable | Valeur à remplacer | Description |
|----------|-------------------|-------------|
| `base_url` | `http://localhost:3000/api` | URL de votre API locale |
| `auth0_domain` | `votre-tenant.eu.auth0.com` | Votre tenant Auth0 |
| `auth0_client_id` | `VOTRE_CLIENT_ID` | Client ID de l'app M2M |
| `auth0_client_secret` | `VOTRE_CLIENT_SECRET` | Client Secret M2M |
| `auth0_audience` | `https://api.ipf.local` | Audience de l'API |

---

## 🔐 Créer une Application M2M dans Auth0

Pour tester l'API avec Postman, vous devez créer une application **Machine-to-Machine** :

### Étapes :

1. **Auth0 Dashboard** → **Applications** → **Applications**
2. **+ Create Application**
3. Remplissez :
   ```
   Name: IPF API Testing (Postman)
   Type: Machine to Machine Applications
   ```
4. Sélectionnez l'API : **IPF API**
5. **Permissions** - Cochez TOUTES les permissions :
   - ✅ `read:quiz`
   - ✅ `read:profile`
   - ✅ `write:profile`
   - ✅ `read:admin`
   - ✅ `write:questions`
   - ✅ `manage:users`
6. **Authorize**

7. Copiez **Client ID** et **Client Secret** dans les variables Postman

---

## 🧪 Tester l'API

### Étape 1 : Obtenir un Token

1. Dossier **🔐 Auth**
2. Requête : **Get Access Token (M2M)**
3. Cliquez **Send**

✅ **Résultat attendu** :
```json
{
  "access_token": "eyJhbGciOiJSUzI1Ni...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

Le token est **automatiquement sauvegardé** dans la variable `access_token`.

---

### Étape 2 : Tester les Routes Publiques

#### Health Check (sans auth)
- **GET** `/api`
- Auth : ❌ Aucune

```json
"Hello World!"
```

---

### Étape 3 : Tester les Routes Protégées

#### Protected Route Test
- **GET** `/api/protected`
- Auth : ✅ Bearer Token

```json
{
  "message": "Vous êtes authentifié!",
  "user": {
    "userId": "auth0|xxxxx",
    "email": "test@example.com",
    "permissions": ["read:quiz", "read:profile", ...],
    "roles": ["user"]
  }
}
```

---

## � Authentification (Nouveau!)

### Endpoints d'authentification

| Route | Méthode | Description |
|-------|---------|-------------|
| `/auth/register` | POST | Créer/synchroniser un compte après connexion Auth0 |
| `/auth/login` | POST | Synchroniser l'utilisateur à chaque connexion |
| `/auth/me` | GET | Récupérer mes informations complètes |
| `/auth/check` | GET | Vérifier si le token est valide |
| `/auth/logout` | POST | Déconnexion (mise à jour lastPlayedAt) |
| `/auth/account` | DELETE | ⚠️ Supprimer mon compte |

### 1. Register / Sync User
**POST** `/api/auth/register`

Appelé après la première connexion Auth0 pour créer l'utilisateur en base.

```json
// Request
{
  "displayName": "MonPseudo" // Optionnel
}

// Response
{
  "message": "Compte créé avec succès",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "role": "USER",
    "profile": {
      "displayName": "MonPseudo",
      "xpTotal": 0,
      "level": 1
    }
  },
  "isNewUser": true
}
```

### 2. Login (Sync User)
**POST** `/api/auth/login`

À appeler à chaque connexion pour synchroniser les données.

```json
// Response
{
  "message": "Connexion réussie",
  "user": { ... },
  "isNewUser": false
}
```

### 3. Get My Info
**GET** `/api/auth/me`

Récupère le profil complet de l'utilisateur connecté.

### 4. Check Auth
**GET** `/api/auth/check`

Vérifie la validité du token.

```json
{
  "authenticated": true,
  "userId": "auth0|...",
  "email": "user@example.com"
}
```

### 5. Logout
**POST** `/api/auth/logout`

Met à jour la dernière activité. La vraie déconnexion se fait côté Auth0.

### 6. Delete Account ⚠️
**DELETE** `/api/auth/account`

Supprime définitivement le compte utilisateur.

---

## �📚 Tests par Module

### 👤 Profile

| Route | Méthode | Permission | Description |
|-------|---------|------------|-------------|
| `/profile` | GET | `read:profile` | Récupérer mon profil |
| `/profile` | PUT | `write:profile` | Mettre à jour mon profil |
| `/profile/stats` | GET | `read:profile` | Mes statistiques |

**Exemple - Update Profile** :
```json
{
  "displayName": "Jean Dupont",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

---

### 🎮 Quiz

| Route | Méthode | Permission | Description |
|-------|---------|------------|-------------|
| `/quiz/start` | POST | `read:quiz` | Démarrer une session |
| `/quiz/answer` | POST | `read:quiz` | Soumettre une réponse |
| `/quiz/:id/complete` | POST | `read:quiz` | Terminer la session |
| `/quiz/history` | GET | `read:quiz` | Historique des sessions |

**Flow de test** :

1. **Start Quiz Session** → Sauvegarde `session_id` et `question_id`
```json
{
  "mode": "PRACTICE",
  "categoryId": "clx..." // Optionnel
}
```

2. **Submit Answer** → Utilise les variables sauvegardées
```json
{
  "sessionId": "{{session_id}}",
  "questionId": "{{question_id}}",
  "answer": "A",
  "responseTimeMs": 3500
}
```

3. **Complete Session** → Obtenir le score final

---

### ❓ Questions

| Route | Méthode | Permission | Description |
|-------|---------|------------|-------------|
| `/questions` | GET | `read:quiz` | Liste des questions |
| `/questions/:id` | GET | `read:quiz` | Détail d'une question |
| `/questions` | POST | `write:questions` | Créer (Admin/Moderator) |
| `/questions/:id` | PUT | `write:questions` | Modifier (Admin/Moderator) |
| `/questions/:id` | DELETE | `write:questions` | Supprimer (Admin/Moderator) |
| `/questions/:id/toggle-active` | POST | `write:questions` | Activer/Désactiver |

**Exemple - Create Question** :
```json
{
  "categoryId": "clx1234567890",
  "text": "Quelle est la durée maximale d'un bail commercial ?",
  "optionA": "6 ans",
  "optionB": "9 ans",
  "optionC": "12 ans",
  "optionD": "15 ans",
  "correctAnswer": "B",
  "level": 1,
  "isPremium": false
}
```

---

### 📚 Categories (Routes Publiques)

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/categories` | GET | ❌ Aucune | Liste des catégories |
| `/categories/:id` | GET | ❌ Aucune | Détail catégorie |
| `/categories/slug/:slug` | GET | ❌ Aucune | Par slug |
| `/categories/:id/themes` | GET | ❌ Aucune | Thèmes de la catégorie |

---

### 👥 Users (Admin uniquement)

| Route | Méthode | Permission | Description |
|-------|---------|------------|-------------|
| `/users` | GET | `manage:users` | Liste des utilisateurs |
| `/users/stats` | GET | `read:admin` | Statistiques utilisateurs |
| `/users/:id` | GET | `manage:users` | Détail utilisateur |
| `/users/:id/role` | PUT | `manage:users` | Changer le rôle |
| `/users/:id/toggle-active` | POST | `manage:users` | Activer/Désactiver |
| `/users/:id/ban` | POST | `manage:users` | Bannir |

**Exemple - Update Role** :
```json
{
  "role": "MODERATOR"
}
```

Rôles disponibles : `USER`, `MODERATOR`, `ADMIN`

---

### 📊 Admin Dashboard

| Route | Méthode | Permission | Description |
|-------|---------|------------|-------------|
| `/admin/dashboard` | GET | `read:admin` | Stats du dashboard |
| `/admin/activity` | GET | `read:admin` | Activité récente |
| `/admin/questions/stats` | GET | `read:admin` | Stats des questions |

---

## 🔍 Tests de Permissions

### Scénario 1 : Utilisateur Standard (USER)

❌ **Doit échouer** :
- Créer une question → `403 Forbidden`
- Gérer les utilisateurs → `403 Forbidden`
- Accéder au dashboard admin → `403 Forbidden`

✅ **Doit réussir** :
- Jouer au quiz
- Lire/modifier son profil
- Voir les catégories

### Scénario 2 : Modérateur (MODERATOR)

✅ **Permissions supplémentaires** :
- Créer/modifier des questions
- Voir les stats des questions

❌ **Toujours interdit** :
- Gérer les utilisateurs
- Accéder au dashboard complet

### Scénario 3 : Admin (ADMIN)

✅ **Accès complet** à toutes les routes

---

## 🛠 Dépannage

### Erreur 401 Unauthorized

**Cause** : Token expiré ou invalide

**Solution** :
1. Refaire la requête **Get Access Token**
2. Vérifier les variables Auth0

### Erreur 403 Forbidden

**Cause** : Permission manquante

**Solution** :
1. Vérifier les permissions de l'app M2M dans Auth0
2. Vérifier que le token contient les bonnes permissions (décodez-le sur jwt.io)

### Erreur 404 Not Found

**Cause** : API non démarrée ou mauvaise URL

**Solution** :
```bash
cd apps/api
npm run start:dev
```

Vérifier que l'API tourne sur `http://localhost:3000`

---

## 📝 Variables Auto-Sauvegardées

Certaines requêtes sauvegardent automatiquement des variables :

| Requête | Variable sauvegardée | Usage |
|---------|---------------------|-------|
| **Get Access Token** | `access_token` | Utilisé dans toutes les requêtes auth |
| **Start Quiz Session** | `session_id` | Pour soumettre les réponses |
| **Start Quiz Session** | `question_id` | Pour tester submit answer |

---

## 🎯 Ordre de Test Recommandé

1. ✅ Health Check (public)
2. 🔐 Get Access Token
3. ✅ Protected Route Test
4. 📚 Get Categories (public)
5. 👤 Get Profile
6. 🎮 Quiz complet (start → answer → complete)
7. ❓ Questions (CRUD)
8. 👥 Users (admin)
9. 📊 Admin Dashboard

---

## 📦 Export des Résultats

Pour partager avec l'équipe :

1. **Runner** → Sélectionnez la collection
2. **Run** → Exécute tous les tests
3. **Export Results** → Sauvegarde les résultats

---

**Collection prête à l'emploi ! 🚀**

Tous les tokens et IDs sont automatiquement gérés.
