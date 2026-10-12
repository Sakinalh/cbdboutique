# 0014 — Isoler l'authentification derrière un port

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 5.1 à 5.5

## Contexte

Il faut des comptes clients et un rôle administrateur, gratuitement, exécutés dans l'API sur
Workers. Les bibliothèques d'authentification gèrent elles-mêmes leurs tables et leurs routes,
ce qui va à l'encontre de [0003](0003-adopter-la-clean-architecture.md) si on les laisse se
répandre dans le code.

## Décision

- **Better Auth**, exécuté dans l'API, confiné à `infra/auth`.
- Le reste du code ne connaît qu'un port (`Authenticator` / utilisateur courant) qui expose ce
  dont le métier a besoin : identité, rôle.
- Cookie de session sur le domaine principal, partagé entre `boutique.fr` et `api.boutique.fr`.

## Alternatives écartées

- **Auth hébergée (Clerk, Auth0)** — payante au-delà des quotas, données clients chez un tiers.
- **Authentification maison** — trop risquée à écrire soi-même (règle de [0013](0013-limiter-les-dependances.md)).

## Conséquences

- ✅ Changer de solution d'authentification ne touche que l'adapter.
- ⚠️ Better Auth crée ses propres tables : elles relèvent de l'adapter, pas du schéma métier.
