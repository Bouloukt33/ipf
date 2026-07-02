# =============================================================================
# Dockerfile - Web Admin React/Vite (IPF - 5 Secondes Chrono)
# Multi-stage build — contexte de build = RACINE du monorepo (npm workspaces)
#   docker build -f apps/web-admin/Dockerfile .
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 : Build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /repo

# Build arguments pour Vite (inlinés dans le bundle au build)
ARG VITE_API_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE

COPY package.json package-lock.json ./
COPY apps/web-admin/package.json apps/web-admin/

RUN npm ci --workspace=web-admin

COPY apps/web-admin apps/web-admin

RUN npm run build --workspace=web-admin

# ---------------------------------------------------------------------------
# Stage 2 : Serve avec Nginx
# ---------------------------------------------------------------------------
FROM nginx:stable-alpine

COPY --from=builder /repo/apps/web-admin/dist /usr/share/nginx/html

# Config nginx pour le routing SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
