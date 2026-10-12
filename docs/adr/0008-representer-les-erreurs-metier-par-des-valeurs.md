# 0008 — Représenter les erreurs métier par des valeurs (`Result`)

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 2.3, 4.4

## Contexte

Beaucoup d'échecs sont des cas normaux du métier : produit introuvable, stock insuffisant,
code promo expiré. Avec des exceptions, le type d'une fonction ne dit pas comment elle peut
échouer, et un cas oublié devient une erreur 500.

## Décision

- Les erreurs **attendues** sont renvoyées dans un type `Result<T, E>` (`core/shared`), avec des
  erreurs métier typées (`ProductNotFound`, `InsufficientStock`).
- Les exceptions restent réservées à l'**inattendu** (panne réseau, bug), interceptées par un
  gestionnaire commun dans l'API.
- L'API traduit chaque erreur métier en réponse HTTP au format d'erreur commun (ticket 4.4) ;
  le `switch` exhaustif (règle ESLint) garantit qu'aucune n'est oubliée.

## Alternatives écartées

- **Exceptions partout** — voir le contexte.
- **Bibliothèque (neverthrow, Effect)** — un type `Result` de quelques lignes suffit, sans
  dépendance ni nouveau paradigme à apprendre.

## Conséquences

- ✅ Les cas d'échec font partie de la signature et sont vérifiés par le compilateur.
- ⚠️ Un peu plus verbeux à l'appel (`if (!result.ok) …`).
