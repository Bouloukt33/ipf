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

### Infrastructure + Applications (API + Web App + Web Admin)

```bash
docker compose --profile app up -d --build
```

### Avec outils admin (pgAdmin + Redis Commander)

```bash
docker compose --profile app --profile tools up -d --build
```

### Arreter les containers

```bash
docker compose --profile app down
```

### Arreter et supprimer les volumes (reset DB)

```bash
docker compose --profile app down -v
```

### Voir les logs

```bash
docker compose --profile app logs -f
docker compose logs api -f
docker compose logs web-app -f
docker compose logs web-admin -f
```

### Rebuild une app specifique

```bash
docker compose --profile app up -d --build api
docker compose --profile app up -d --build web-app
docker compose --profile app up -d --build web-admin
```

### Prisma Studio (inspecter la base)

```bash
cd apps/api && npx prisma studio
```

Fonctionne pendant que Docker tourne car PostgreSQL est expose sur localhost:5432.

## Ports

| Service          | Port |
|------------------|------|
| PostgreSQL       | 5432 |
| Redis            | 6379 |
| API NestJS       | 3000 |
| Web App Next.js  | 3001 |
| Web Admin (Vite) | 5173 |
| pgAdmin          | 5050 |
| Redis Commander  | 8081 |

## Mode local (developpement)

Arreter Docker et relancer les services systeme :

```bash
docker compose --profile app down
sudo systemctl start redis-server postgresql
```

Puis dans des terminaux separes :

```bash
# API
cd apps/api && npm run start:dev

# Web App
cd apps/web-app && npx next dev --port 3001

# Prisma Studio (optionnel)
cd apps/api && npx prisma studio
```

## Basculer entre les modes

Ne pas lancer Docker et local en meme temps (conflits de ports).

Docker vers local :

```bash
docker compose --profile app down
sudo systemctl start redis-server postgresql
```

Local vers Docker :

```bash
sudo systemctl stop redis-server postgresql
docker compose --profile app up -d --build
```

## Notes

- Les migrations Prisma s'executent automatiquement au demarrage de l'API en mode Docker.
- En mode local, lancer les migrations manuellement si necessaire :

```bash
cd apps/api && npx prisma migrate deploy
```
