# 0004 — Injecter les dépendances sans conteneur

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 2.5

## Contexte

Avec [0003](0003-adopter-la-clean-architecture.md), les cas d'usage reçoivent leurs ports de
l'extérieur. Il faut choisir comment les câbler. L'API tourne sur Cloudflare Workers, où la
configuration (`env`) n'est connue qu'à la requête.

## Décision

- **Injection par paramètres** : un cas d'usage est une fabrique qui reçoit ses dépendances
  (`makeGetProduct({ products })`).
- **Un seul composition root** (`apps/api/src/composition-root.ts`, `buildContainer(env)`)
  choisit quelle implémentation brancher sur quel port. C'est le seul fichier qui connaît à la
  fois `core` et `infra`.
- Pas de bibliothèque d'injection, pas de décorateurs, pas de `reflect-metadata`.

## Alternatives écartées

- **InversifyJS / tsyringe** — reposent sur des décorateurs et `reflect-metadata`, ajoutent une
  dépendance et de la « magie » ; mal adaptés à Workers.
- **Imports directs de singletons** — rend le remplacement en test impossible sans mocks de
  modules.

## Conséquences

- ✅ Le câblage est du TypeScript ordinaire : vérifié par le compilateur, lisible d'un coup d'œil.
- ✅ Les tests construisent leur propre conteneur avec les adapters en mémoire.
- ⚠️ Le composition root grossit avec le projet ; on le découpe par fonctionnalité si besoin.
