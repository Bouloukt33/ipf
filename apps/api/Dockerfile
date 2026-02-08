# =============================================================================
# Dockerfile - API NestJS (IPF - 5 Secondes Chrono)
# Multi-stage build optimisé pour production
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Installation des dépendances
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour un meilleur cache
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && \
    npx prisma generate

# ---------------------------------------------------------------------------
# Stage 2 : Build de l'application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma + build NestJS
RUN npx prisma generate && \
    npm run build

# ---------------------------------------------------------------------------
# Stage 3 : Image de production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Sécurité : utilisateur non-root
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Copier les dépendances de production
COPY --from=deps /app/node_modules ./node_modules

# Copier le build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Copier Prisma (nécessaire pour les migrations en runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Config Prisma pour les migrations en runtime (sans dotenv car l'env vient de Docker)
RUN echo 'const { defineConfig } = require("prisma/config"); module.exports = defineConfig({ schema: "prisma/schema.prisma", migrations: { path: "prisma/migrations" }, datasource: { url: process.env.DATABASE_URL } });' > prisma.config.js && chown nestjs:nestjs prisma.config.js

# Script d'entrypoint (migrations auto au démarrage)
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["./docker-entrypoint.sh"]
