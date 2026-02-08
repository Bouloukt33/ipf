# =============================================================================
# Dockerfile - Web App Next.js (IPF - 5 Secondes Chrono)
# Multi-stage build optimisé pour production
# Basé sur les recommandations officielles Next.js
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Installation des dépendances
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2 : Build de l'application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .


ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Activer le output standalone de Next.js pour une image plus légère
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3 : Image de production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Sécurité : utilisateur non-root
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers publics
COPY --from=builder /app/public ./public

# Copier le build standalone de Next.js
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]
