# ProReview 🌟

**SaaS B2B pour collecter des avis Google 5 étoiles automatiquement**

ProReview aide les commerçants (restaurants, coiffeurs, garagistes, etc.) à collecter des avis Google positifs en interceptant les feedbacks négatifs.

## Stack technique

- **Next.js 14** App Router (TypeScript)
- **Tailwind CSS** + composants shadcn/ui custom
- **Supabase** (Auth + Database + RLS)
- **Stripe** (abonnements mensuels)
- **Twilio** (envoi SMS)
- **Resend** (envoi emails)
- **Framer Motion** (animations)
- **Recharts** (graphiques dashboard)

## Installation

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplissez toutes les variables dans .env.local

# 3. Appliquer le schéma SQL dans Supabase
# Copiez le contenu de supabase/schema.sql dans l'éditeur SQL de votre projet Supabase

# 4. Lancer en développement
npm run dev
```

## Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase (pour les API routes) |
| `NEXT_PUBLIC_APP_URL` | URL de l'app (ex: https://app.proreview.fr) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe |
| `STRIPE_STARTER_PRICE_ID` | Price ID du plan Starter |
| `STRIPE_PRO_PRICE_ID` | Price ID du plan Pro |
| `STRIPE_BUSINESS_PRICE_ID` | Price ID du plan Business |
| `TWILIO_ACCOUNT_SID` | SID du compte Twilio |
| `TWILIO_AUTH_TOKEN` | Token d'auth Twilio |
| `TWILIO_PHONE_NUMBER` | Numéro Twilio émetteur |
| `RESEND_API_KEY` | Clé API Resend |

## Architecture

```
proreview/
├── app/
│   ├── page.tsx              → Landing page publique
│   ├── auth/                 → Pages de connexion/inscription
│   ├── dashboard/            → Interface commerçant (protégée)
│   ├── review/[code]/        → Page avis client (publique)
│   └── api/                  → API Routes
├── components/
│   ├── ui/                   → Composants shadcn/ui
│   ├── landing/              → Composants landing page
│   └── dashboard/            → Composants dashboard
├── lib/                      → Clients Supabase, Stripe, Twilio, Resend
├── hooks/                    → Hooks React personnalisés
├── types/                    → Types TypeScript
└── supabase/schema.sql       → Schéma base de données
```

## Fonctionnement

1. **Ajout client** → Le commerçant ajoute ses clients manuellement, via CSV ou QR code
2. **Envoi automatique** → X heures après la visite, un SMS/email est envoyé avec un lien unique
3. **Filtre intelligent** → Score ≥ 4 → Redirection Google · Score ≤ 3 → Formulaire privé
4. **Résultat** → Que des avis positifs sur Google, les négatifs restent privés

## Déploiement sur Vercel

```bash
vercel --prod
```

Le cron d'envoi automatique est configuré dans `vercel.json` pour s'exécuter toutes les heures.

## Plans et tarifs

| Plan | Prix | SMS/mois | Établissements |
|------|------|----------|----------------|
| Free | 0€ | 50 | 1 |
| Starter | 29€ | 100 | 1 |
| Pro | 59€ | 500 | 3 |
| Business | 99€ | 2000 | Illimité |
