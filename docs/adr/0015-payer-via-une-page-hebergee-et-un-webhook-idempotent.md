# 0015 — Payer via une page hébergée et un webhook idempotent

- **Statut** : proposé (prestataire à choisir)
- **Date** : 2026-10-12
- **Tickets liés** : 7.7, 7.8, 8.5

## Contexte

Stripe et PayPal refusent souvent les marchands de CBD. Le prestataire n'est pas encore
choisi, mais le tunnel de commande doit pouvoir être construit. On ne veut pas manipuler de
données de carte (contraintes PCI-DSS).

## Décision

- Port `PaymentGateway` (créer une session de paiement, vérifier un webhook, rembourser),
  indépendant du prestataire.
- Paiement sur la **page hébergée** du prestataire : aucune donnée de carte ne transite par
  nos serveurs.
- La confirmation vient **uniquement du webhook** (signature vérifiée), jamais du retour du
  navigateur. Le webhook est **idempotent** : le même événement reçu deux fois n'a d'effet
  qu'une fois.
- Le paiement émet `OrderPaid` ; la commande, le stock et les e-mails réagissent à cet
  événement ([0005](0005-decouper-par-fonctionnalite.md)).

## Alternatives écartées

- **Formulaire de carte intégré** — contraintes PCI plus lourdes.
- **Confirmer au retour du navigateur** — falsifiable et perdu si l'utilisateur ferme l'onglet.

## Conséquences

- ✅ Le tunnel peut être développé et testé avec l'adapter en mémoire avant le choix du
  prestataire.
- ⚠️ Passera en « accepté » quand le prestataire sera choisi (bloquant pour l'EPIC 7).
