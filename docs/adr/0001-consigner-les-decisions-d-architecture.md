# 0001 — Consigner les décisions d'architecture

- **Statut** : accepté
- **Date** : 2026-10-12

## Contexte

Le projet est développé ticket par ticket, en grande partie par un agent IA, et suivi via les
PR. Sans trace écrite, le _pourquoi_ d'un choix (ex. « pourquoi pas
TypeScript 7 ? ») se perd et finit rediscuté ou défait par erreur.

## Décision

Chaque décision structurante fait l'objet d'un **ADR** (Architecture Decision Record) dans
`docs/adr/`, numéroté, au format de [template.md](template.md).

- Est structurant : un choix de technologie, une règle d'architecture, une dépendance
  importante, un compromis qu'on pourrait vouloir défaire plus tard.
- Un ADR accepté ne se réécrit pas : pour changer d'avis, on écrit un nouvel ADR qui le
  **remplace**, et on met à jour le statut de l'ancien.
- L'ADR est livré dans la même PR que le code qui applique la décision.

## Alternatives écartées

- **Tout garder dans `docs/plan.md`** — le plan dit _quoi faire_, il devient illisible s'il
  doit aussi garder l'historique des _pourquoi_.
- **Wiki externe** — se désynchronise du code ; les ADR sont versionnés et relus avec lui.

## Conséquences

- ✅ Le raisonnement reste consultable et relu en PR.
- ⚠️ Discipline : la définition de « fini » d'un ticket inclut l'ADR quand il y a lieu.
