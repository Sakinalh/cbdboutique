# Boutique CBD

Monorepo pnpm + Turborepo. Plan technique et découpage en tickets : [docs/plan.md](docs/plan.md).

## Prérequis

- Node.js ≥ 24 (voir `.nvmrc`)
- pnpm 10 (`corepack enable`)

## Commandes

| Commande            | Rôle                                         |
| ------------------- | -------------------------------------------- |
| `pnpm install`      | installe les dépendances de tous les paquets |
| `pnpm typecheck`    | vérifie les types (TypeScript strict)        |
| `pnpm lint`         | lint                                         |
| `pnpm format`       | formate tout le dépôt (Prettier)             |
| `pnpm format:check` | vérifie le format sans modifier              |
| `pnpm test`         | tests                                        |
| `pnpm build`        | build des applications                       |

## Applications

| Application | Rôle            | Lancer en local                                      |
| ----------- | --------------- | ---------------------------------------------------- |
| `apps/web`  | site Next.js 16 | `pnpm --filter @cbd/web dev` → http://localhost:3000 |

## Configuration partagée

`packages/config` contient la configuration commune (TypeScript strict, ESLint, Prettier).
Chaque paquet étend TypeScript :

```json
{ "extends": "@cbd/config/tsconfig/base.json" }
```

et déclare ESLint dans un `eslint.config.js` (`@cbd/config/eslint/next` pour une application Next.js) :

```js
import { createConfig } from '@cbd/config/eslint';

export default createConfig({ tsconfigRootDir: import.meta.dirname });
```

## Hooks Git

Installés automatiquement par `pnpm install` (simple-git-hooks) :

- **pre-commit** : vérifie le format des fichiers indexés ;
- **pre-push** : format, lint et types sur tout le dépôt (rapide grâce au cache Turborepo).
