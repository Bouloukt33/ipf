# Docker - IPF (5 Secondes Chrono)

## Prérequis

- Docker >= 24
- Docker Compose >= 2

## Architecture

Le monorepo utilise **npm workspaces** : le `package-lock.json` unique est à la
racine, donc **tous les builds Docker utilisent la racine du repo comme
contexte** (`context: .` + `dockerfile: apps/<app>/Dockerfile`).

Deux fichiers compose :

| Fichier | Usage |
|---|---|
| `docker-compose.yml` | Local : infra + profils `app` (images prod), `dev` (hot-reload), `tools` |
| `docker-compose.prod.yml` | Déploiement production (`NODE_ENV=production`, mot de passe requis, DB non exposée) |

## Configuration

```bash
cp .env.example .env
```

Remplir les variables Auth0 dans le fichier `.env`.

## Commandes

### Infrastructure seule (PostgreSQL + Redis)

```bash
docker compose up -d
```

### Infrastructure + Applications (images de production)

```bash
docker compose --profile app up -d --build
```

Lance : API (3000), Web App (3001), Web Admin (3002), Landing (3004).

### Développement avec hot-reload

```bash
docker compose --profile dev up -d --build
```

Le code source est monté en volume : les modifications dans `apps/*` sont
visibles en live (nest --watch / next dev).

### Avec outils admin (pgAdmin + Redis Commander)

```bash
docker compose --profile app --profile tools up -d --build
```

### Production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

`POSTGRES_PASSWORD` est **obligatoire** (pas de valeur par défaut en prod).

### Arrêter les containers

```bash
docker compose --profile app down
```

### Arrêter et supprimer les volumes (reset DB)

```bash
docker compose --profile app down -v
```

### Voir les logs

```bash
docker compose --profile app logs -f
docker compose logs api -f
docker compose logs web-app -f
```

### Rebuild une app spécifique

```bash
docker compose --profile app up -d --build api
docker compose --profile app up -d --build web-app
```

### Prisma Studio (inspecter la base)

```bash
npx prisma studio --schema apps/api/prisma/schema.prisma
```

Fonctionne pendant que Docker tourne car PostgreSQL est exposé sur localhost:5432.

## Ports

| Service          | Port |
|------------------|------|
| PostgreSQL       | 5432 |
| Redis            | 6379 |
| API NestJS       | 3000 |
| Web App Next.js  | 3001 |
| Web Admin (nginx)| 3002 |
| Landing Next.js  | 3004 |
| pgAdmin          | 5050 |
| Redis Commander  | 8081 |

## Mode local (sans Docker pour les apps)

Lancer uniquement l'infra en Docker puis les apps en local :

```bash
docker compose up -d          # Postgres + Redis
npm run dev                   # api + web-app + admin en parallèle
```

## Notes

- Les migrations Prisma s'exécutent automatiquement au démarrage du conteneur
  API. **Une migration en échec arrête le conteneur** (fail-fast) — c'est
  volontaire : l'API ne doit jamais tourner sur un schéma désynchronisé.
- Le CLI prisma est épinglé dans l'image (pas de `npx` qui télécharge au boot).
- En mode local, lancer les migrations manuellement si nécessaire :

```bash
cd apps/api && npx prisma migrate deploy
```
