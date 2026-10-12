# Boutique CBD

Monorepo pnpm + Turborepo. Plan technique et découpage en tickets : [docs/plan.md](docs/plan.md).

## Prérequis

- Node.js ≥ 20.9 (voir `.nvmrc`)
- pnpm 10 (`corepack enable`)

## Commandes

| Commande | Rôle |
|---|---|
| `pnpm install` | installe les dépendances de tous les paquets |
| `pnpm typecheck` | vérifie les types (TypeScript strict) |
| `pnpm lint` | lint |
| `pnpm test` | tests |
| `pnpm build` | build des applications |

## Configuration partagée

`packages/config` contient la configuration TypeScript stricte commune.
Chaque paquet l'étend :

```json
{ "extends": "@cbd/config/tsconfig/base.json" }
```
