# =============================================================================
# Dockerfile - Web Admin (Vite React)
# Multi-stage build pour servir le dashboard admin
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Installation des dependances
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

ARG VITE_API_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ARG VITE_AUTH0_ROLE_CLAIM

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}
ENV VITE_AUTH0_ROLE_CLAIM=${VITE_AUTH0_ROLE_CLAIM}

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3 : Image de production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

ENV NODE_ENV=production
ENV PORT=5173

CMD ["serve", "-s", "dist", "-l", "5173"]
