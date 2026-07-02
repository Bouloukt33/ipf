# =============================================================================
# Dockerfile - Web App Next.js (IPF - 5 Secondes Chrono)
# Multi-stage build — contexte de build = RACINE du monorepo (npm workspaces)
#   docker build -f apps/web-app/Dockerfile .
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /repo

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
COPY apps/web-app/package.json apps/web-app/
# Dépendance workspace @ipf/shared (source complète : son prepare la builde)
COPY packages/shared packages/shared/

RUN npm ci --workspace=web-app --workspace=@ipf/shared

COPY apps/web-app apps/web-app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=@ipf/shared && \
    npm run build --workspace=web-app

# ---------------------------------------------------------------------------
# Stage 2 : Image de production
# Le build standalone (outputFileTracingRoot = racine monorepo) produit :
#   .next/standalone/apps/web-app/server.js + node_modules minimal à la racine
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nextjs /repo/apps/web-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /repo/apps/web-app/public ./apps/web-app/public
COPY --from=builder --chown=nextjs:nextjs /repo/apps/web-app/.next/static ./apps/web-app/.next/static

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "apps/web-app/server.js"]
