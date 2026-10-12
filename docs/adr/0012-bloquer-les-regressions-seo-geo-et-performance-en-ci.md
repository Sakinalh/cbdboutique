# 0012 — Bloquer les régressions SEO, GEO et performance en CI

- **Statut** : accepté
- **Date** : 2026-10-12
- **Tickets liés** : 3.1 à 3.9

## Contexte

La publicité étant très restreinte pour le CBD, le **SEO** et le **GEO** (être cité par les
assistants IA) sont les canaux d'acquisition principaux. Une balise canonical cassée, une URL
supprimée sans redirection ou une page alourdie peuvent coûter des semaines de visibilité, et
passent facilement inaperçues en revue.

## Décision

- Chaque PR est déployée en prévisualisation puis **comparée à `main`** : Lighthouse, poids par
  route, latence de l'API, balises SEO par gabarit, JSON-LD, sitemap et redirections, contrôles
  GEO (`robots.txt`, `llms.txt`, Markdown, contenu lisible sans JavaScript), accessibilité.
- Les références attendues sont **versionnées dans le dépôt** (`quality/`). Un changement
  voulu se fait en mettant à jour la référence dans la même PR : le diff est visible en revue.
- Toute régression **bloque la fusion**. Un commentaire unique sur la PR résume les résultats.
- Une exécution nocturne rejoue les contrôles sur la production et ouvre une issue si besoin.

## Alternatives écartées

- **Outils SaaS de surveillance SEO** — payants, et constatent le problème après la mise en
  production.
- **Contrôles manuels avant mise en ligne** — non systématiques.

## Conséquences

- ✅ Les régressions sont arrêtées avant la production.
- ⚠️ Les mesures Lighthouse varient d'une exécution à l'autre : médiane de 3 passages et
  seuils avec marge.
- ⚠️ Chaque nouveau gabarit de page doit être ajouté à `quality/pages.ts` (définition de « fini »).
