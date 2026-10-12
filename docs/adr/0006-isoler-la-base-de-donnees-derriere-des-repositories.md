# 0006 — Isoler la base de données derrière des repositories

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 4.1, 4.2, 6.2

## Contexte

Il faut une base relationnelle (commandes, stock, transactions), gratuite au départ,
utilisable depuis Cloudflare Workers, avec une base isolée par PR pour tester les migrations.
On veut aussi pouvoir en changer sans toucher au métier.

## Décision

- **Neon** (PostgreSQL serverless) via son **pilote HTTP** (compatible Workers), avec une
  **branche de base par PR** supprimée à la fusion.
- **Drizzle ORM** pour le schéma et les migrations versionnées, **uniquement dans
  `infra/db-drizzle`**.
- Le métier n'accède aux données que par des **ports repositories** (`ProductRepository`…)
  aux méthodes orientées métier.
- Chaque repository passe une **suite de tests de contrat** partagée avec son équivalent en
  mémoire. Une nouvelle base = un nouvel adapter qui passe la même suite.
- Les tables arrivent avec la fonctionnalité qui en a besoin, pas toutes d'un coup.

## Alternatives écartées

- **Supabase** — offre gratuite mise en pause après inactivité ; apporte beaucoup de services
  qu'on n'utilise pas.
- **Cloudflare D1 (SQLite)** — très bien intégré, mais pas de branches par PR comparables et
  moins adapté aux transactions de stock concurrentes.
- **Prisma** — moteur plus lourd et historiquement moins à l'aise sur Workers ; Drizzle est
  proche du SQL et sans moteur séparé.

## Conséquences

- ✅ Migrations testées sur une vraie base à chaque PR.
- ✅ Les cas d'usage ne connaissent ni Drizzle ni PostgreSQL.
- ⚠️ Les transactions (décrément de stock atomique) doivent être exprimées dans le port sans
  fuiter de détails SQL : à concevoir avec soin au ticket 7.1.
