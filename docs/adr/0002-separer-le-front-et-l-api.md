# 0002 — Séparer le front (Next.js) et l'API (Hono sur Cloudflare Workers)

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 1.3, 1.4, 1.6

## Contexte

La boutique a deux natures : un site public dont le SEO, le GEO et la performance sont
critiques, et une logique e-commerce (stock, paiement, webhook, comptes, tâches planifiées)
qui doit être fiable et testable. Contrainte : **0 € avant les premières ventes**.

## Décision

- `apps/web` : **Next.js 16** (App Router) sur **Netlify**, uniquement la présentation et le
  rendu serveur des pages.
- `apps/api` : **Hono** sur **Cloudflare Workers**, toute la logique métier et l'accès aux
  données.
- Le front ne parle **jamais** à la base : tout passe par l'API (`api.boutique.fr`).

## Alternatives écartées

- **Tout dans Next.js (route handlers / server actions)** — mélange présentation et métier,
  couple le métier à un framework front et à son hébergeur.
- **API sur un serveur Node classique (Render, Railway…)** — les offres gratuites se mettent
  en veille (premier appel lent) ou demandent une carte bancaire ; Workers n'a ni l'un ni l'autre.
- **Tout chez un seul hébergeur** — Netlify est déjà maîtrisé pour le front (Maison Nao Laser).

## Conséquences

- ✅ Le métier est testable et déployable indépendamment du site.
- ✅ On peut changer de framework front sans toucher au métier.
- ⚠️ Deux déploiements à synchroniser par PR (ticket 1.6) et un contrat d'API à garder
  cohérent ([0007](0007-partager-le-contrat-d-api-en-zod.md)).
- ⚠️ Workers impose ses limites (pas d'API Node complètes, temps CPU par requête) : les
  dépendances doivent être compatibles.
