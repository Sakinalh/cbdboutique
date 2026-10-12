# 0011 — Imposer la qualité du code par l'outillage

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 1.2, 2.2, 2.6, 2.7

## Contexte

Le code est écrit vite et en petites PR. Les règles de « clean code » n'ont de valeur que si
elles sont appliquées systématiquement, sans dépendre de la vigilance de la relecture.

## Décision

- **ESLint** partagé (`@cbd/config/eslint`) : typescript-eslint `strict-type-checked` +
  `stylistic-type-checked`, et des limites chiffrées (complexité ≤ 10, profondeur ≤ 3,
  ≤ 3 paramètres, fonctions ≤ 50 lignes, fichiers ≤ 300 lignes), pas d'export par défaut,
  `switch` exhaustif, aucune promesse flottante. Toutes les règles sont des **erreurs**.
- **Prettier** pour le format : aucune discussion de style en revue.
- **Hooks Git légers** (simple-git-hooks) : format au commit ; format, lint et types au push.
  La CI rejoue tout et reste la seule barrière qui compte.
- À venir : règles de frontières (2.2), couverture qui ne peut pas baisser (2.6), knip et
  jscpd (2.7).

## Alternatives écartées

- **Biome** — plus rapide, mais pas de lint basé sur les types ni d'équivalent des règles de
  frontières et d'accessibilité JSX dont on a besoin.
- **husky + lint-staged** — deux dépendances là où simple-git-hooks (zéro dépendance) et une
  ligne de shell suffisent.
- **Avertissements plutôt qu'erreurs** — ils s'accumulent et finissent ignorés.

## Conséquences

- ✅ Les règles du plan sont vérifiées à chaque PR.
- ⚠️ Le lint typé est plus lent ; le cache Turborepo compense.
- ⚠️ Une limite peut gêner un cas légitime : on la désactive localement avec un commentaire
  qui explique pourquoi (les directives inutiles sont signalées).
