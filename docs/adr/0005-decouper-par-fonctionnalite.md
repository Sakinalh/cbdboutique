# 0005 — Découper le code par fonctionnalité métier

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 2.1, 2.2

## Contexte

Un rangement par type technique (`services/`, `repositories/`, `components/`) disperse une
même fonctionnalité dans tout le dépôt et laisse chaque module lire les données des autres.
On veut des « services » aux frontières nettes, et des PR petites qui touchent un seul endroit.

## Décision

- Le code est rangé **par fonctionnalité** : `catalog`, `lab-reports`, `inventory`, `cart`,
  `ordering`, `payments`, `accounts`, `content`, `discovery` (responsabilités détaillées dans
  `docs/plan.md`). Même découpage dans `core`, `apps/api/src/routes` et `apps/web/src/features`.
- Chaque fonctionnalité expose une API publique (`index.ts`) ; les autres n'importent que ça.
- Les fonctionnalités communiquent par leurs **cas d'usage publics** ou par des **événements
  métier** (`ProductPublished`, `OrderPaid`), jamais en lisant les tables d'une autre.

## Alternatives écartées

- **Rangement par type technique** — voir le contexte.
- **Microservices** — un seul développeur, un seul déploiement : complexité sans bénéfice.
  Le découpage par fonctionnalité permet d'extraire un service plus tard si besoin.

## Conséquences

- ✅ Une PR touche en général une seule fonctionnalité : facile à suivre.
- ✅ Frontières vérifiées par ESLint (ticket 2.2).
- ⚠️ Il faut parfois arbitrer à quelle fonctionnalité appartient un concept ; on le note dans
  le tableau des responsabilités du plan.
