# 0009 — Organiser le dépôt en monorepo pnpm + Turborepo

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 1.1

## Contexte

Front, API, métier, adapters et contrats évoluent ensemble ; une modification de contrat doit
être livrée avec ses deux côtés dans la même PR.

## Décision

- Un seul dépôt, **pnpm workspaces** (`apps/*`, `packages/*`) et **Turborepo** pour orchestrer
  et mettre en cache `build`, `typecheck`, `lint`, `test`.
- Les paquets internes (`core`, `infra`, `contracts`, `config`) sont **consommés directement en
  TypeScript**, sans étape de compilation propre : ce sont les applications qui compilent.
- Portée provisoire des paquets : `@cbd/…` (en attendant le nom de la boutique).

## Alternatives écartées

- **Plusieurs dépôts** — versions à synchroniser, PR croisées.
- **Nx** — plus puissant mais plus lourd ; Turborepo suffit à cette taille.
- **npm / yarn workspaces** — pnpm est plus rapide et strict (pas d'accès aux dépendances non
  déclarées).

## Conséquences

- ✅ Une PR = un changement cohérent de bout en bout.
- ✅ Pas de build intermédiaire à maintenir pour les paquets internes.
- ⚠️ pnpm étant strict, chaque paquet doit déclarer toutes ses dépendances.
