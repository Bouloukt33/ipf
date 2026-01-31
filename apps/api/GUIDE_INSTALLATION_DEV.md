# 🚀 Guide d'Installation Complet - Backend API IPF

Ce guide détaille **toutes les étapes** pour installer et faire fonctionner le backend API sur un nouveau poste de développeur (Linux/Ubuntu).

---

## 📋 Prérequis

- **Système d'exploitation** : Linux (Ubuntu 20.04+) ou WSL2 sur Windows
- **Droits administrateur** : `sudo` disponible
- **Connexion internet** : Pour télécharger les dépendances

---

## 🔧 Étape 1 : Installer les outils de base

### 1.1 Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Installer les utilitaires essentiels

```bash
sudo apt install -y curl wget git build-essential
```

---

## 📦 Étape 2 : Installer Node.js (v20 LTS recommandé)

### Option A : Via NVM (Recommandé) ⭐

NVM permet de gérer plusieurs versions de Node.js facilement.

```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recharger le terminal
source ~/.bashrc
# ou
source ~/.zshrc

# Vérifier l'installation
nvm --version

# Installer Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Vérifier les versions
node --version   # Doit afficher v20.x.x
npm --version    # Doit afficher 10.x.x
```

### Option B : Via apt (NodeSource)

```bash
# Ajouter le dépôt NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js
sudo apt install -y nodejs

# Vérifier
node --version
npm --version
```

---

## 🐘 Étape 3 : Installer PostgreSQL

### 3.1 Installer PostgreSQL

```bash
# Installer PostgreSQL et les extensions
sudo apt install -y postgresql postgresql-contrib

# Vérifier le statut
sudo systemctl status postgresql

# Démarrer PostgreSQL si nécessaire
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Configurer PostgreSQL

```bash
# Se connecter en tant qu'utilisateur postgres
sudo -u postgres psql
```

Dans le shell PostgreSQL, exécuter ces commandes :

```sql
-- Créer la base de données pour le développement
CREATE DATABASE ipf_db;

-- Créer l'utilisateur pour l'application
CREATE USER ipf_admin WITH PASSWORD 'votre_mot_de_passe_securise';

-- Donner les droits à l'utilisateur
ALTER USER ipf_admin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE ipf_db TO ipf_admin;

-- Se connecter à la base ipf_db pour configurer les droits
\c ipf_db

-- Donner tous les droits sur le schéma public
GRANT ALL ON SCHEMA public TO ipf_admin;
ALTER SCHEMA public OWNER TO ipf_admin;

-- Quitter
\q
```

### 3.3 Tester la connexion

```bash
# Tester la connexion avec le nouvel utilisateur
psql -U ipf_admin -d ipf_db -h localhost -W
# Entrer le mot de passe quand demandé

# Si ça marche, vous verrez le prompt: ipf_db=>
# Tapez \q pour quitter
```

#### ⚠️ Problème de connexion ?

Si vous avez une erreur d'authentification, modifiez le fichier `pg_hba.conf` :

```bash
# Trouver le fichier
sudo find /etc -name "pg_hba.conf"

# Éditer le fichier (généralement /etc/postgresql/14/main/pg_hba.conf)
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Modifier la ligne "local all all peer" en :
# local   all             all                                     md5

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

---

## 🔴 Étape 4 : Installer Redis (pour le cache)

### 4.1 Installer Redis

```bash
# Installer Redis
sudo apt install -y redis-server

# Démarrer Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Vérifier le statut
sudo systemctl status redis-server
```

### 4.2 Tester Redis

```bash
# Tester la connexion
redis-cli ping
# Doit retourner: PONG

# Vérifier les infos
redis-cli info | head -20
```

### 4.3 (Optionnel) Configurer Redis

Par défaut, Redis écoute sur `localhost:6379` sans mot de passe, ce qui est suffisant pour le développement local.

---

## 📁 Étape 5 : Cloner le projet

```bash
# Aller dans votre dossier de travail
cd ~/projets  # ou le dossier de votre choix

# Cloner le repository
git clone <URL_DU_REPO> ipf
cd ipf
```

---

## ⚙️ Étape 6 : Configurer l'API

### 6.1 Aller dans le dossier API

```bash
cd apps/api
```

### 6.2 Créer le fichier d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier
nano .env  # ou code .env si VS Code est installé
```

### 6.3 Remplir le fichier `.env`

```dotenv
# Auth0 Configuration
# Demander les valeurs au lead dev ou utiliser un tenant de test
AUTH0_DOMAIN=votre-tenant.auth0.com
AUTH0_AUDIENCE=https://api.ipf.com

# Application
PORT=3000
NODE_ENV=development

# Database PostgreSQL
# Remplacer 'votre_mot_de_passe_securise' par le mot de passe créé à l'étape 3.2
DATABASE_URL="postgresql://ipf_admin:votre_mot_de_passe_securise@localhost:5432/ipf_db"

# Redis (pour le cache)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**⚠️ Important :** 
- Remplacez `votre_mot_de_passe_securise` par le mot de passe que vous avez défini pour PostgreSQL
- Demandez les valeurs `AUTH0_DOMAIN` et `AUTH0_AUDIENCE` à votre lead dev

---

## 📦 Étape 7 : Installer les dépendances

```bash
# Depuis le dossier apps/api
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json`.

---

## 🗄️ Étape 8 : Configurer la base de données avec Prisma

### 8.1 Générer le client Prisma

```bash
npx prisma generate
```

### 8.2 Appliquer les migrations

```bash
npx prisma migrate deploy
```

Ou pour créer les tables en mode développement :

```bash
npx prisma migrate dev
```

### 8.3 Vérifier la base de données

```bash
# Ouvrir Prisma Studio (interface graphique pour la BDD)
npx prisma studio
```

Cela ouvrira un navigateur à l'adresse `http://localhost:5555` où vous pourrez voir les tables.

---

## 🚀 Étape 9 : Lancer l'API

### 9.1 Mode développement (avec hot-reload)

```bash
npm run start:dev
```

### 9.2 Vérifier que l'API fonctionne

Vous devriez voir :

```
🚀 API running on http://localhost:3000/api
📚 Swagger documentation available at http://localhost:3000/api/docs
```

### 9.3 Tester dans le navigateur

- API Health Check : http://localhost:3000/api
- Documentation Swagger : http://localhost:3000/api/docs

---

## ✅ Étape 10 : Vérification finale

### Liste de vérification

| Service | Commande de vérification | Résultat attendu |
|---------|-------------------------|------------------|
| Node.js | `node --version` | v20.x.x |
| npm | `npm --version` | 10.x.x |
| PostgreSQL | `sudo systemctl status postgresql` | Active (running) |
| Redis | `redis-cli ping` | PONG |
| API | `curl http://localhost:3000/api` | Réponse JSON |

---

## 🧪 Exécuter les tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

---

## 🐛 Résolution des problèmes courants

### Problème : "Connection refused" PostgreSQL

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Redémarrer si nécessaire
sudo systemctl restart postgresql
```

### Problème : Erreur d'authentification PostgreSQL

```bash
# Vérifier le fichier pg_hba.conf
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$"

# S'assurer que la méthode md5 est utilisée pour les connexions locales
```

### Problème : "Redis connection refused"

```bash
# Vérifier que Redis tourne
sudo systemctl status redis-server

# Redémarrer si nécessaire
sudo systemctl restart redis-server
```

### Problème : "Cannot find module @prisma/client"

```bash
# Régénérer le client Prisma
npx prisma generate
```

### Problème : "Migration failed"

```bash
# Réinitialiser la base de données (⚠️ PERD TOUTES LES DONNÉES)
npx prisma migrate reset

# Puis réappliquer les migrations
npx prisma migrate dev
```

### Problème : Ports déjà utilisés

```bash
# Vérifier quel processus utilise le port 3000
sudo lsof -i :3000

# Tuer le processus si nécessaire
sudo kill -9 <PID>
```

---

## 📚 Commandes utiles au quotidien

```bash
# Démarrer l'API en mode dev
npm run start:dev

# Voir la documentation Swagger
# Naviguer vers http://localhost:3000/api/docs

# Ouvrir Prisma Studio (visualiser la BDD)
npx prisma studio

# Créer une nouvelle migration après modification du schema.prisma
npx prisma migrate dev --name nom_de_la_migration

# Formater le code
npm run format

# Linter le code
npm run lint
```

---

## 🐳 Alternative : Utiliser Docker (Optionnel)

Si vous préférez utiliser Docker pour PostgreSQL et Redis :

### docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: ipf-postgres
    environment:
      POSTGRES_USER: ipf_admin
      POSTGRES_PASSWORD: votre_mot_de_passe_securise
      POSTGRES_DB: ipf_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: ipf-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Pour utiliser Docker :

```bash
# Installer Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Se déconnecter et reconnecter pour appliquer les groupes

# Lancer les services
docker-compose up -d

# Vérifier
docker-compose ps
```

---

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs : `npm run start:dev` affiche les erreurs
2. Consultez la documentation Swagger : http://localhost:3000/api/docs
3. Contactez le lead dev avec :
   - Le message d'erreur complet
   - Les étapes pour reproduire le problème
   - Votre version de Node.js (`node --version`)

---

**Bonne installation ! 🎉**
