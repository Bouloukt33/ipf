# Déploiement gratuit — environnement de test client

Stack 100 % gratuite pour faire tester l'application à distance :

| Brique | Service | Plan | Rôle |
|---|---|---|---|
| API NestJS | [Render](https://render.com) | Free | `apps/api` via Docker (`render.yaml`) |
| Postgres | [Neon](https://neon.tech) | Free (0,5 Go) | Base de données |
| web-app | [Vercel](https://vercel.com) | Hobby | App apprenant (Next.js) |
| web-admin | Vercel | Hobby | Dashboard admin (Vite SPA) |
| landing | Vercel | Hobby | Vitrine (Next.js) |
| Auth | Auth0 existant | Free | Ajouter les URLs de prod aux callbacks |

> Redis n'est **pas** déployé : les dépendances sont présentes dans
> `apps/api/package.json` mais le code ne l'utilise pas encore. Ajouter
> Upstash le jour où un module l'importera.

**Limite connue du plan Render Free** : l'API s'endort après ~1 min
d'inactivité (réveil ≈ 30-60 s à la première requête). Contournement :
un moniteur [UptimeRobot](https://uptimerobot.com) gratuit qui ping
`https://<api>.onrender.com/api` toutes les 5 minutes.

---

## 1. Neon (Postgres)

1. Créer un projet (région `eu-central-1` de préférence).
2. Récupérer la **connection string directe** (bouton *Connect*,
   décocher *Connection pooling*) : `prisma migrate deploy` ne passe pas
   par PgBouncer. Format :
   `postgresql://<user>:<pass>@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
3. Ne PAS créer les tables à la main — les migrations tournent au boot
   du conteneur API (fail-fast).

## 2. Render (API)

1. Dashboard → **New → Blueprint** → connecter le repo GitHub → Render
   détecte `render.yaml` à la racine.
2. Renseigner les variables `sync: false` :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | connection string Neon **directe** (étape 1) |
| `AUTH0_DOMAIN` | ex. `<tenant>.eu.auth0.com` (sans `https://`) |
| `AUTH0_AUDIENCE` | l'audience de l'API Auth0 (ex. `https://api.ipf.local`) |
| `AUTH0_CLIENT_ID` | client ID Auth0 |
| `CORS_ORIGINS` | URLs Vercel séparées par des virgules, ex. `https://ipf-web-app.vercel.app,https://ipf-web-admin.vercel.app` |

3. Premier déploiement : suivre les logs — les migrations Prisma tournent
   avant le démarrage ; un conteneur qui boucle = migration en échec.
4. Vérifier : `curl https://<api>.onrender.com/api` → message de bienvenue.

## 3. Vercel (3 projets sur le même repo)

Créer **trois projets** Vercel pointant sur le même repo GitHub, en ne
changeant que le *Root Directory* (l'install npm se fait à la racine du
monorepo automatiquement — workspaces). Framework auto-détecté
(Next.js × 2, Vite pour web-admin ; le rewrite SPA de web-admin est déjà
dans `apps/web-admin/vercel.json`).

### 3a. `ipf-web-app` — Root Directory : `apps/web-app`

| Variable | Valeur |
|---|---|
| `AUTH0_DOMAIN` | `<tenant>.eu.auth0.com` |
| `AUTH0_CLIENT_ID` | client ID Auth0 |
| `AUTH0_CLIENT_SECRET` | client secret Auth0 |
| `AUTH0_SECRET` | `openssl rand -hex 32` (secret de session, propre à cet env) |
| `AUTH0_AUDIENCE` | audience de l'API Auth0 |
| `APP_BASE_URL` | `https://ipf-web-app.vercel.app` (URL finale du projet) |
| `NEXT_PUBLIC_API_URL` | `https://<api>.onrender.com` (sans `/api` final) |
| `API_INTERNAL_URL` | même valeur que `NEXT_PUBLIC_API_URL` (pas de réseau interne sur Vercel) |

### 3b. `ipf-web-admin` — Root Directory : `apps/web-admin`

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | `https://<api>.onrender.com` (sans `/api` final) |
| `VITE_AUTH0_DOMAIN` | `<tenant>.eu.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | client ID Auth0 |
| `VITE_AUTH0_AUDIENCE` | audience de l'API Auth0 |

### 3c. `ipf-landing` — Root Directory : `apps/landing`

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://ipf-web-app.vercel.app` |

## 4. Auth0 — URLs à ajouter (application existante)

Dashboard Auth0 → Applications → l'application utilisée par le front :

| Champ | Ajouter |
|---|---|
| Allowed Callback URLs | `https://ipf-web-app.vercel.app/auth/callback`, `https://ipf-web-admin.vercel.app/admin/dashboard` |
| Allowed Logout URLs | `https://ipf-web-app.vercel.app`, `https://ipf-web-admin.vercel.app` |
| Allowed Web Origins | `https://ipf-web-app.vercel.app`, `https://ipf-web-admin.vercel.app` |

(Conserver les URLs localhost existantes pour le dev.)

## 5. Ordre de mise en route et dépendances croisées

Les URLs se référencent mutuellement — l'ordre qui évite les redéploiements :

1. **Neon** → donne `DATABASE_URL`.
2. **Render** → donne l'URL de l'API (mettre un `CORS_ORIGINS` provisoire).
3. **Vercel × 3** → donnent les URLs des fronts.
4. Mettre à jour `CORS_ORIGINS` sur Render avec les vraies URLs Vercel,
   et `APP_BASE_URL` / `NEXT_PUBLIC_APP_URL` si besoin (redeploy auto).
5. **Auth0** → ajouter les callbacks (étape 4).

## 6. Smoke test

```bash
curl -s https://<api>.onrender.com/api            # accueil API
curl -s https://<api>.onrender.com/api/categories # données publiques
```

Puis dans le navigateur : landing → web-app → login Auth0 → quiz, et
web-admin → login → dashboard. Le premier appel après une période
d'inactivité prend ~30-60 s (réveil Render).
