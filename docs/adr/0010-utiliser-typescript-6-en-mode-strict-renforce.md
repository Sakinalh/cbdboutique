# 0010 — Utiliser TypeScript 6.0 en mode strict renforcé

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 1.1, 1.2

## Contexte

TypeScript est le langage de tout le projet. La version 7 (compilateur réécrit en Go) est
sortie, mais **typescript-eslint 8.71 ne supporte que TypeScript < 6.1** ; or le lint basé sur
les types est central dans nos règles de qualité ([0011](0011-imposer-la-qualite-par-l-outillage.md)).

## Décision

- **TypeScript 6.0.x**, version figée.
- Configuration partagée `@cbd/config/tsconfig/base.json` : `strict` +
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
  `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `noUnused*`,
  `verbatimModuleSyntax`, `moduleResolution: bundler`.

## Alternatives écartées

- **TypeScript 7** — perdrait le lint typé (règles sur les promesses, `switch` exhaustif…).
- **`strict` seul** — laisse passer l'accès à un tableau supposé non vide et la confusion
  entre propriété absente et `undefined`, deux sources de bugs fréquentes.

## Conséquences

- ✅ Une grande partie des bugs est arrêtée à la compilation.
- ⚠️ À revoir quand typescript-eslint supportera TypeScript 7 : nouvel ADR qui remplacera celui-ci.
