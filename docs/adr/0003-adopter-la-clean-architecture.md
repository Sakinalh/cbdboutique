# 0003 — Adopter la clean architecture (ports & adapters)

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 2.1, 2.2, 2.4

## Contexte

On veut pouvoir changer de fournisseur (base de données, e-mails, images, paiement,
authentification) sans réécrire le métier, et tester les règles métier vite, sans réseau.
Le prestataire de paiement, en particulier, n'est pas encore choisi (contrainte CBD).

## Décision

Le code est organisé en couches, et **les dépendances pointent toujours vers le métier** :

| Couche                              | Rôle                                     | Peut importer                |
| ----------------------------------- | ---------------------------------------- | ---------------------------- |
| `core/<fonctionnalité>/domain`      | règles pures (prix, TVA, stock, statuts) | `core/shared`                |
| `core/<fonctionnalité>/application` | cas d'usage                              | `domain`, `ports`            |
| `core/<fonctionnalité>/ports`       | interfaces vers l'extérieur              | `domain`                     |
| `infra/*`                           | adapters : implémentent les ports        | `core` (ports, types)        |
| `apps/api`                          | HTTP + composition root                  | `core`, `infra`, `contracts` |
| `apps/web`                          | présentation                             | `contracts` uniquement       |

- `packages/core` a **zéro dépendance d'exécution**.
- Chaque port a au moins une implémentation réelle et une **en mémoire**, qui passent la
  même suite de **tests de contrat**.
- Les règles d'import sont vérifiées par ESLint (ticket 2.2), pas par la bonne volonté.

## Alternatives écartées

- **Architecture en couches classique (routes → services → Drizzle)** — le métier dépend
  alors directement de l'ORM ; changer de base implique de toucher aux services.
- **Hexagonal « complet » avec bus de commandes / CQRS** — trop de cérémonie pour la taille
  du projet.

## Conséquences

- ✅ Changer de base ou de prestataire = un nouvel adapter + une ligne dans le composition root.
- ✅ Les cas d'usage se testent en millisecondes avec les adapters en mémoire.
- ⚠️ Plus de fichiers et d'interfaces qu'une approche directe.
- ⚠️ Risque de « fausse abstraction » : un port doit refléter un besoin métier
  (`findPublishedBySlug`), pas recopier l'API de l'ORM.
