# =============================================================================
# Dockerfile - API NestJS (IPF - 5 Secondes Chrono)
# Multi-stage build — contexte de build = RACINE du monorepo (npm workspaces)
#   docker build -f apps/api/Dockerfile .
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Build (dépendances complètes + prisma generate + nest build)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /repo

RUN apk add --no-cache libc6-compat openssl

# Lockfile racine + manifests du workspace (cache Docker optimal)
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma/
COPY apps/api/prisma.config.ts apps/api/

# Installe les deps du workspace "api" (le postinstall lance prisma generate
# → client généré dans /repo/node_modules/.prisma/client)
RUN npm ci --workspace=api

# Code source + build NestJS
COPY apps/api apps/api
RUN npm run build --workspace=api

# ---------------------------------------------------------------------------
# Stage 2 : Dépendances de production uniquement
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /repo

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
# Le schéma est requis : l'installation du CLI redéclenche le postinstall
# du workspace api (prisma generate)
COPY apps/api/prisma apps/api/prisma/

# npm ci --ignore-scripts : deps de prod sans postinstall.
# Puis CLI prisma ÉPINGLÉ pour exécuter les migrations au démarrage
# (fail-fast, pas de npx qui télécharge à chaud).
RUN npm ci --workspace=api --omit=dev --ignore-scripts && \
    npm install --no-save prisma@7.8.0

# ---------------------------------------------------------------------------
# Stage 3 : Image de production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# Sécurité : utilisateur non-root
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Dépendances de production + client Prisma généré
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=builder /repo/node_modules/.prisma ./node_modules/.prisma

# Build NestJS + schéma/migrations Prisma (nécessaires au démarrage)
COPY --from=builder /repo/apps/api/dist ./dist
COPY apps/api/prisma ./prisma
COPY apps/api/package.json ./

# Config Prisma runtime : objet simple, l'env vient de Docker (pas de dotenv)
RUN printf 'module.exports = { schema: "prisma/schema.prisma", migrations: { path: "prisma/migrations" }, datasource: { url: process.env.DATABASE_URL } };\n' > prisma.config.js && \
    chown nestjs:nestjs prisma.config.js

# Entrypoint : migrations puis démarrage (échec migration = échec conteneur)
COPY apps/api/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["./docker-entrypoint.sh"]
