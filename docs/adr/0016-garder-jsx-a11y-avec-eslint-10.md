# 0016 — Garder eslint-plugin-jsx-a11y avec ESLint 10

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 1.3

## Contexte

L'accessibilité stricte (WCAG 2.2 AA / RGAA) est une exigence du projet, et
`eslint-plugin-jsx-a11y` est la référence pour la vérifier dans le JSX. Sa dernière version
(6.10.2, octobre 2024) ne déclare la compatibilité que jusqu'à ESLint 9, alors que le projet
utilise ESLint 10 ([0011](0011-imposer-la-qualite-par-l-outillage.md)).

## Décision

- On garde `eslint-plugin-jsx-a11y` 6.10.2 en mode **strict**.
- Compatibilité **vérifiée** avec ESLint 10 sur un composant volontairement fautif : les
  règles se déclenchent (texte alternatif, rôles ARIA, `tabIndex`, titres vides, sous-titres
  des vidéos, interactions clavier…).
- L'avertissement de dépendance est levé explicitement dans `pnpm-workspace.yaml`
  (`peerDependencyRules`), avec un renvoi vers cet ADR.
- Le lint échoue sur le moindre avertissement (`--max-warnings 0`).

## Alternatives écartées

- **Rester sur ESLint 9** — pour un seul plugin, on renoncerait aux évolutions d'ESLint.
- **Forks (`eslint-plugin-jsx-a11y-x`, `@htmlacademy/eslint-plugin-jsx-a11y`)** — moins
  utilisés et moins éprouvés ; à reconsidérer si le plugin d'origine casse.
- **Se reposer uniquement sur axe-core (ticket 1.7)** — axe vérifie la page rendue, jsx-a11y
  signale le problème dans l'éditeur, avant même le commit. Les deux sont complémentaires.

## Conséquences

- ✅ L'accessibilité est vérifiée dès l'écriture du composant.
- ⚠️ Une future version d'ESLint pourrait casser le plugin : la CI le verrait immédiatement.
  On passera alors à un fork ou à une nouvelle version, via un ADR qui remplacera celui-ci.
