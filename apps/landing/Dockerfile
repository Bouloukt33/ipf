# =============================================================================
# Dockerfile - Landing Next.js (IPF - 5 Secondes Chrono)
# Multi-stage build — contexte de build = RACINE du monorepo (npm workspaces)
#   docker build -f apps/landing/Dockerfile .
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /repo

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
COPY apps/landing/package.json apps/landing/

RUN npm ci --workspace=landing

COPY apps/landing apps/landing

# Garantir que le dossier public existe pour le output standalone
RUN mkdir -p apps/landing/public

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=landing

# ---------------------------------------------------------------------------
# Stage 2 : Image de production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nextjs /repo/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /repo/apps/landing/public ./apps/landing/public
COPY --from=builder --chown=nextjs:nextjs /repo/apps/landing/.next/static ./apps/landing/.next/static

USER nextjs

EXPOSE 3004

ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "apps/landing/server.js"]
