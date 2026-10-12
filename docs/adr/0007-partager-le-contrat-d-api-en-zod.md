# 0007 — Partager le contrat d'API en Zod

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 4.3

## Contexte

Front et API sont séparés ([0002](0002-separer-le-front-et-l-api.md)). Sans contrat commun,
un champ renommé côté API casse le site en production sans que rien ne le signale avant.

## Décision

- `packages/contracts` contient les **schémas Zod** des requêtes et réponses.
- L'API valide les entrées avec ces schémas ; le front utilise les types inférés.
- La documentation **OpenAPI** est générée depuis les mêmes schémas.
- Les contrats décrivent le format HTTP : ils sont distincts des entités du domaine (le
  mapping se fait dans les routes de l'API).

## Alternatives écartées

- **Types TypeScript seuls** — pas de validation à l'exécution des entrées.
- **OpenAPI écrit à la main + génération de types** — deux sources de vérité.
- **tRPC** — couple fortement le front à l'API et ne produit pas d'API HTTP documentée
  réutilisable (admin, outils, IA).

## Conséquences

- ✅ Une rupture de contrat casse la compilation du front en CI.
- ⚠️ Zod est une dépendance de `contracts` et de l'API, pas de `core` (qui reste sans dépendance).
