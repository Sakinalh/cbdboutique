# 0013 — Limiter les dépendances

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 2.1, 2.7, 3.1

## Contexte

Chaque dépendance ajoute du poids (côté navigateur ou dans la limite de taille d'un Worker), de
la surface d'attaque, des mises à jour à suivre et parfois des incompatibilités avec Cloudflare
Workers.

## Décision

- `packages/core` : **zéro dépendance d'exécution**, vérifié en CI.
- On préfère les API de la plateforme (`fetch`, `crypto.subtle`, `Intl`, `URL`,
  `structuredClone`) et quelques lignes de code maison à une bibliothèque pour un besoin simple.
- Toute nouvelle dépendance est listée dans le rapport de PR (poids, licence) et **justifiée
  dans la description**. Versions figées (pas de `^`) pour les dépendances directes.
- knip signale les dépendances inutilisées ; Dependabot regroupe les mises à jour.

## Alternatives écartées

- **Aucune règle** — l'arbre de dépendances grossit sans que personne ne l'ait décidé.

## Conséquences

- ✅ Moins de poids, moins de failles, moins de mises à jour cassantes.
- ⚠️ Un peu plus de code maison à tester ; on n'écrit pas soi-même ce qui est critique et
  difficile (cryptographie, authentification, ORM).
