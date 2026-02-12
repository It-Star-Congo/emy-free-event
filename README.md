# EMY FREE EVENT - Site Web Full-Stack

Site web moderne FR pour `EMY FREE EVENT` (location de matériel événementiel spécialisé concerts), construit avec Express + EJS + Sequelize.

## Stack

- Front: `Express + EJS`
- Back: `Node.js / Express`
- DB:
  - Dev: `sqlite3`
  - Prod: `PostgreSQL`
- ORM: `Sequelize`
- Auth admin: JWT (rôle `admin`)
- Upload: stockage local en dev + abstraction prête pour S3/Cloudinary en prod

## Fonctionnalités livrées

- Pages publiques:
  - `/` (Accueil)
  - `/services` + `/services/:slug`
  - `/packs-concerts`
  - `/catalogue` (catégories + filtres prix/puissance/dispo)
  - `/produit/:slug`
  - `/devis` (multi-étapes) + `/devis/confirmation`
  - `/realisations`
  - `/a-propos`
  - `/contact`
  - `/cgv`, `/privacy`
- Panier de devis:
  - ajout/retrait d’items
  - quantité
- Checkout / paiement:
  - `/checkout` (récap panier + infos client)
  - création commande (`orders`, `order_items`)
  - transaction (`payment_transactions`)
  - page paiement démo (`/checkout/payer/:orderId`) prête à remplacer par un provider réel
  - envoi facture PDF par email après paiement (SMTP)
  - fallback téléchargement facture (`/checkout/invoice/:orderId`)
- Demande de devis:
  - multi-étapes
  - enregistrement DB
  - upload rider
  - notification email mock (console)
  - lien WhatsApp pré-rempli
- Back-office admin:
  - `/admin/login`
  - `/admin` (stats devis nouveaux + devis du mois)
  - `/admin/produits` CRUD + upload image
  - `/admin/packs` CRUD + upload image
  - `/admin/devis` liste + détail + changement statut + export PDF
  - `/admin/calendrier` (modèle optionnel prêt)

## Installation

1. Installer les dépendances:

```bash
npm install
```

2. Copier `.env.example` vers `.env` et ajuster si besoin.

3. Migrer et seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Démarrer:

```bash
npm run dev
```

App disponible sur `http://localhost:3000`.

## Scripts

- `npm run dev`: démarrage avec nodemon
- `npm start`: démarrage standard
- `npm run db:migrate`: migrations Sequelize
- `npm run db:seed`: seeders Sequelize
- `npm run db:reset`: reset DB + migrate + seed

## Configuration email automatique

Configurer EmailJS dans `.env`:

- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_USER_ID`
- `ADMIN_NOTIFICATION_EMAIL` (bonus: copie notifications)

Envois automatiques branchés:

- confirmation client de demande de devis
- notification admin de nouveau devis
- facture PDF client après paiement
- copie facture à l’admin (si configuré)

## Données seed

- 10 produits
- 3 packs concerts (200 pers / 500 pers / 1000+)
- 5 réalisations
- 1 admin user

## Accès admin (seed)

- Email: valeur de `ADMIN_EMAIL` (par défaut `admin@emyfreeevent.com`)
- Mot de passe: valeur de `ADMIN_PASSWORD` (par défaut `admin12345`)

## Structure principale

- `src/app.js`: configuration Express
- `src/server.js`: bootstrap serveur
- `src/models/*`: modèles Sequelize
- `migrations/*`: schéma DB
- `seeders/*`: données de démonstration
- `src/controllers/*`: logique front et admin
- `src/routes/*`: routes publiques et admin
- `views/*`: templates EJS
- `public/css/styles.css`: UI responsive mobile-first
