# JOOP COMPANY

Boutique e-commerce Next.js 14 pour bijoux, parfums et encens au Senegal.

## Ce projet contient

- une boutique en ligne avec catalogue, fiche produit, panier et checkout
- un back-office admin pour produits, commandes, clients et analytics
- Prisma + PostgreSQL pour la base de donnees
- PayDunya pour Wave, Orange Money et paiement a la livraison
- un catalogue de demonstration JOOP COMPANY

## Lancer le projet

```bash
cd joop-compagny
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Le site sera disponible sur `http://localhost:3000`.

## Comptes seedes

Le seed ne cree plus de comptes avec des mots de passe connus par defaut.

- Pour creer un admin de bootstrap, definir `SEED_ADMIN_PASSWORD` avant `npm run db:seed`
- `SEED_ADMIN_EMAIL` est optionnel et vaut `admin@joop-compagny.com` par defaut
- Les comptes demo staff/client ne sont crees que si `SEED_DEMO_USERS=true` et que leurs mots de passe sont renseignes

Exemple local :

```bash
SEED_ADMIN_PASSWORD="ChangeMeNow123!" npm run db:seed
```

## Variables importantes

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_TOKEN`
- `SMTP_PASS`

## Deploiement recommande

- un projet Vercel dedie a `joop-compagny/`
- une base PostgreSQL dediee
- un domaine dedie
- des variables d'environnement propres a JOOP COMPANY

## Note d'isolation

Ce dossier a ete cree comme nouvelle base distincte pour eviter toute interference avec le premier site.
