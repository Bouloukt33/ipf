# IPF — Configuration & Intégrations à brancher

Ce fichier trace les services externes à configurer avant mise en production.
Mettre à jour au fur et à mesure que les credentials sont obtenus.

---

## 📧 Email (nodemailer)

**Fichier :** `apps/api/.env`

```env
# ── Email (SMTP) ──────────────────────────────────────────────────────────────
# Option A — SendGrid (recommandé)
MAILER_HOST=smtp.sendgrid.net
MAILER_PORT=587
MAILER_SECURE=false
MAILER_USER=apikey
MAILER_PASS=SG.xxxxxxxxxxxxxxxxxxxx   # clé API SendGrid

# Option B — Resend
MAILER_HOST=smtp.resend.com
MAILER_PORT=465
MAILER_SECURE=true
MAILER_USER=resend
MAILER_PASS=re_xxxxxxxxxxxxxxxxxxxx   # clé API Resend

# Option C — Gmail (dev uniquement)
MAILER_HOST=smtp.gmail.com
MAILER_PORT=587
MAILER_SECURE=false
MAILER_USER=ton.email@gmail.com
MAILER_PASS=xxxx xxxx xxxx xxxx      # mot de passe d'application Google

# Expéditeur affiché
MAILER_FROM="5 Secondes Chrono <noreply@ipf.com>"
```

**Sans config** : les emails sont loggés en console (aucun plantage).

**Templates disponibles** (dans `apps/api/src/admin/admin.service.ts`) :
- `upsell` — Apprenti très engagés → passer Compagnon
- `coaching` — Compagnon/Réussite précision < 55%
- `welcome` — Bienvenue nouvel utilisateur
- `reminder` — Rappel série en danger

**Interface admin** : `/admin/emails` (prévisualisation + envoi segmenté)

---

## 💳 Stripe (non intégré — prévu)

**Fichier :** `apps/api/.env`

```env
# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

**Champs déjà prêts dans le schema Prisma** :
- `Plan.stripePriceId`
- `Subscription.stripeSubscriptionId`
- `Subscription.stripeCustomerId`

**Scope du travail restant** : checkout session, webhook (payment_intent, subscription events), portal client.

---

## 🔐 Auth0

**Fichiers :** `.env` (racine) + `apps/api/.env`

```env
AUTH0_DOMAIN=votre-tenant.eu.auth0.com
AUTH0_AUDIENCE=https://api.ipf.com
AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
AUTH0_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
AUTH0_SECRET=xxxxxxxxxxxxxxxxxxxx          # next-auth secret, min 32 chars
NEXTAUTH_URL=https://app.ipf.com           # URL publique Next.js
```

**Redirect URIs à configurer dans Auth0 Dashboard** :
- Callback : `https://app.ipf.com/api/auth/callback`
- Logout : `https://app.ipf.com`

---

## 🗄️ Base de données / Redis

```env
DATABASE_URL="postgresql://user:password@host:5432/ipf_prod"
REDIS_URL="redis://user:password@host:6379"
```

---

## 🌐 URLs applicatives

```env
NEXT_PUBLIC_API_URL=https://api.ipf.com
API_URL=https://api.ipf.com
NEXTAUTH_URL=https://app.ipf.com
```

---

## ✅ Checklist avant prod

- [ ] Configurer SMTP (SendGrid ou Resend)
- [ ] Créer compte Stripe + récupérer les clés
- [ ] Configurer tenant Auth0 production (redirect URIs, RBAC)
- [ ] Provisionner PostgreSQL et Redis en prod
- [ ] Vérifier les variables d'environnement dans docker-compose ou le déploiement
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET` après création du webhook Stripe
