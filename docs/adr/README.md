# Décisions d'architecture (ADR)

Chaque décision structurante est consignée ici, avec son contexte, les alternatives écartées
et ses conséquences. Pourquoi et comment : [0001](0001-consigner-les-decisions-d-architecture.md).
Pour en écrire une nouvelle : copier [template.md](template.md) avec le numéro suivant.

| N°                                                                   | Décision                                                  | Statut  |
| -------------------------------------------------------------------- | --------------------------------------------------------- | ------- |
| [0001](0001-consigner-les-decisions-d-architecture.md)               | Consigner les décisions d'architecture                    | accepté |
| [0002](0002-separer-le-front-et-l-api.md)                            | Séparer le front (Next.js) et l'API (Hono sur Workers)    | accepté |
| [0003](0003-adopter-la-clean-architecture.md)                        | Adopter la clean architecture (ports & adapters)          | accepté |
| [0004](0004-injecter-les-dependances-sans-conteneur.md)              | Injecter les dépendances sans conteneur                   | accepté |
| [0005](0005-decouper-par-fonctionnalite.md)                          | Découper le code par fonctionnalité métier                | accepté |
| [0006](0006-isoler-la-base-de-donnees-derriere-des-repositories.md)  | Isoler la base de données derrière des repositories       | accepté |
| [0007](0007-partager-le-contrat-d-api-en-zod.md)                     | Partager le contrat d'API en Zod                          | accepté |
| [0008](0008-representer-les-erreurs-metier-par-des-valeurs.md)       | Représenter les erreurs métier par des valeurs (`Result`) | accepté |
| [0009](0009-organiser-le-depot-en-monorepo.md)                       | Organiser le dépôt en monorepo pnpm + Turborepo           | accepté |
| [0010](0010-utiliser-typescript-6-en-mode-strict-renforce.md)        | Utiliser TypeScript 6.0 en mode strict renforcé           | accepté |
| [0011](0011-imposer-la-qualite-par-l-outillage.md)                   | Imposer la qualité du code par l'outillage                | accepté |
| [0012](0012-bloquer-les-regressions-seo-geo-et-performance-en-ci.md) | Bloquer les régressions SEO, GEO et performance en CI     | accepté |
| [0013](0013-limiter-les-dependances.md)                              | Limiter les dépendances                                   | accepté |
| [0014](0014-isoler-l-authentification-derriere-un-port.md)           | Isoler l'authentification derrière un port                | accepté |
| [0015](0015-payer-via-une-page-hebergee-et-un-webhook-idempotent.md) | Payer via une page hébergée et un webhook idempotent      | proposé |
