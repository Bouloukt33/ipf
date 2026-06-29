# =============================================================================
# Dockerfile - Landing Next.js (IPF - 5 Secondes Chrono)
# Multi-stage build optimisé pour production
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Installation des dépendances
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2 : Build de l'application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Garantir que le dossier public existe pour le output standalone
RUN mkdir -p /app/public

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 3 : Image de production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3004

ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]
