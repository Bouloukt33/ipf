# Docker - IPF (5 Secondes Chrono)

## Prérequis

- Docker >= 24
- Docker Compose >= 2

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

### Développement avec hot-reload (API + Web App)

```bash
docker compose --profile dev up -d --build
```

Les modifications dans `apps/api` et `apps/web-app` sont détectées automatiquement sans rebuild.

### Avec outils admin en mode dev

```bash
docker compose --profile dev --profile tools up -d --build
```

### Infrastructure + Applications en mode production

```bash
docker compose --profile app up -d --build
```

### Avec outils admin en mode production

```bash
docker compose --profile app --profile tools up -d --build
```

### Arrêter les containers

```bash
# Mode dev
docker compose --profile dev down

# Mode production
docker compose --profile app down
```

### Arrêter et supprimer les volumes (reset DB)

```bash
docker compose --profile dev down -v
docker compose --profile app down -v
```

### Voir les logs

```bash
# Mode dev
docker compose --profile dev logs -f
docker compose logs api-dev -f
docker compose logs web-app-dev -f

# Mode production
docker compose --profile app logs -f
docker compose logs api -f
docker compose logs web-app -f
```

### Rebuild une app spécifique

```bash
# Mode dev
docker compose --profile dev up -d --build api-dev
docker compose --profile dev up -d --build web-app-dev

# Mode production
docker compose --profile app up -d --build api
docker compose --profile app up -d --build web-app
```

### Prisma Studio (inspecter la base)

```bash
cd apps/api && npx prisma studio
```

Fonctionne pendant que Docker tourne car PostgreSQL est exposé sur `localhost:5432`.

## Ports

| Service          | Port  | Dev        | Prod       |
|------------------|-------|------------|------------|
| PostgreSQL       | 5432  | ✓          | ✓          |
| Redis            | 6379  | ✓          | ✓          |
| API NestJS       | 3000  | `api-dev`  | `api`      |
| Web App Next.js  | 3001  | `web-app-dev` | `web-app` |
| Node.js debugger | 9229  | ✓          | —          |
| pgAdmin          | 5050  | `--profile tools` | `--profile tools` |
| Redis Commander  | 8081  | `--profile tools` | `--profile tools` |

## Mode local (développement sans Docker)

Arrêter Docker et relancer les services système :

```bash
docker compose --profile dev down
sudo systemctl start redis-server postgresql
```

Puis dans des terminaux séparés :

```bash
# API
cd apps/api && npm run start:dev

# Web App
cd apps/web-app && npx next dev --port 3001

# Prisma Studio (optionnel)
cd apps/api && npx prisma studio
```

## Basculer entre les modes

Ne pas lancer Docker et local en même temps (conflits de ports).

Docker vers local :

```bash
docker compose --profile dev down
sudo systemctl start redis-server postgresql
```

Local vers Docker :

```bash
sudo systemctl stop redis-server postgresql
docker compose --profile dev up -d --build
```

## Notes

- Les migrations Prisma s'exécutent automatiquement au démarrage de l'API (modes dev et production).
- En mode local, lancer les migrations manuellement si nécessaire :

```bash
cd apps/api && npx prisma migrate deploy
```

- Le cache `.next` est persisté dans un volume Docker entre les redémarrages en mode dev (`ipf-web-app-next-cache`).
- En mode dev, le port `9229` est exposé pour connecter un debugger Node.js (VS Code, Chrome DevTools).