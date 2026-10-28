# Boutique CBD — plan technique (v3 : backend séparé, clean architecture)

Boutique en ligne de CBD sans THC (France), mêmes exigences que Maison Nao Laser :
SEO, **GEO**, accessibilité stricte (WCAG 2.2 AA / RGAA), performance, mobile first,
CI bloquante, **aucune régression SEO / GEO / performance ne passe en production**.
**Aucun coût avant les premières ventes.**

## Architecture

```
Navigateur ──▶ apps/web (Next.js 16, Netlify)  ──HTTPS──▶  apps/api (Hono, Cloudflare Workers)
               pages, SEO, GEO, a11y,                     catalogue, panier, commandes, stock,
               rendu serveur des fiches                   paiement + webhook, comptes, admin,
                                                          IndexNow, tâches planifiées
                                                                │
                                         ┌──────────────────────┼─────────────────┐
                                         ▼                      ▼                 ▼
                                   Neon (PostgreSQL)     Cloudinary          Resend
                                   via pilote HTTP       (images, PDF        (e-mails)
                                                          d'analyses)
```

- Domaines : `boutique.fr` (site) et `api.boutique.fr` (API) ; cookie de session sur le domaine principal.
- Le front ne parle **jamais** à la base : tout passe par l'API.
- Le contrat d'API (schémas Zod) est partagé : un champ modifié côté API casse la compilation du front en CI.

## Stack (0 € au départ)

| Brique                          | Choix                                                                            | Coût avant ventes               |
| ------------------------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| Langage                         | **TypeScript strict** partout (front, API, scripts, tests)                       | 0 €                             |
| Front                           | Next.js 16 (App Router) sur **Netlify**                                          | 0 €                             |
| API                             | **Hono** sur **Cloudflare Workers** (pas de mise en veille, sans carte bancaire) | 0 €                             |
| Contrat d'API                   | **Zod** partagé + documentation **OpenAPI** générée                              | 0 €                             |
| Base de données                 | **Neon** (PostgreSQL serverless, une branche de base par PR)                     | 0 €                             |
| Accès aux données               | **Drizzle ORM** (migrations versionnées), uniquement dans un adapter             | 0 €                             |
| Comptes clients + admin         | **Better Auth**, exécuté dans l'API, isolé derrière un port                      | 0 €                             |
| Images et certificats d'analyse | **Cloudinary** (offre gratuite, optimisation des images)                         | 0 €                             |
| E-mails transactionnels         | **Resend**                                                                       | 0 € (quota gratuit)             |
| Tâches planifiées               | **Cron Triggers** Cloudflare (paniers abandonnés, sauvegardes, IndexNow)         | 0 €                             |
| Paiement                        | Prestataire **acceptant le CBD**, page de paiement hébergée + webhook            | commission par vente uniquement |
| Mesure d'audience               | GA4 via Tag Manager, après consentement (comme MNL)                              | 0 €                             |
| Tests                           | **Vitest** (unitaires, contrats), **Playwright** + axe-core (E2E, a11y)          | 0 €                             |
| Qualité                         | **ESLint** (typescript-eslint, boundaries, jsx-a11y), Prettier, knip, jscpd      | 0 €                             |
| Surveillance des régressions    | **Lighthouse CI**, contrôles SEO/GEO maison, GitHub Actions                      | 0 €                             |
| Monorepo                        | **pnpm workspaces** + **Turborepo** (cache des builds et des tests)              | 0 €                             |
| Domaine                         | à acheter au lancement                                                           | ~7–12 €/an                      |

## Principes d'architecture

### Clean architecture : les dépendances pointent vers le métier

```
        apps/web  ──(client HTTP typé)──▶  apps/api
                                              │
                                    composition root (câblage)
                                    ┌─────────┴──────────┐
                                    ▼                    ▼
                           packages/infra          packages/core
                           (adapters)  ──implémente──▶ ports
                           Drizzle, Resend,         application (cas d'usage)
                           Cloudinary, paiement…    domain (règles pures)
```

- **`domain`** : entités, valeurs, règles métier pures (prix, TVA, stock, statut de commande).
  Aucun import d'infrastructure, aucun `async`, aucune date « système ».
- **`application`** : les cas d'usage (`getProduct`, `addToCart`, `placeOrder`…), le seul endroit
  où l'on orchestre. Ils ne connaissent que des **ports**.
- **`ports`** : des interfaces TypeScript (`ProductRepository`, `Mailer`, `PaymentGateway`,
  `MediaStorage`, `SearchEngineNotifier`, `Clock`, `IdGenerator`…).
- **`infra` (adapters)** : les implémentations concrètes des ports. C'est le **seul** endroit qui
  connaît Drizzle, Neon, Resend, Cloudinary, le prestataire de paiement.
- **`apps/api`** : routes HTTP fines (validation Zod → appel d'un cas d'usage → réponse) +
  **composition root** qui choisit quel adapter brancher sur quel port.
- **`apps/web`** : présentation uniquement ; appelle l'API, jamais `core` ni `infra`.

### Injection de dépendances (sans bibliothèque)

Injection par paramètres, câblage manuel dans un seul fichier : pas de conteneur, pas de
décorateurs ni de `reflect-metadata` (inutiles et mal adaptés à Cloudflare Workers).

```ts
// packages/core/src/catalog/ports/product-repository.ts
export interface ProductRepository {
  findBySlug(slug: Slug): Promise<Product | null>;
}

// packages/core/src/catalog/application/get-product.ts
export const makeGetProduct =
  ({ products }: { products: ProductRepository }) =>
  async (slug: Slug): Promise<Result<Product, ProductNotFound>> => {
    /* … */
  };

// apps/api/src/composition-root.ts — le SEUL fichier qui choisit les implémentations
export const buildContainer = (env: Env) => {
  const db = createNeonClient(env.DATABASE_URL);
  const products = new DrizzleProductRepository(db);
  return { getProduct: makeGetProduct({ products }) };
};
```

**Changer de base de données** = écrire un nouvel adapter (`MongoProductRepository`, etc.), le
faire passer la **même suite de tests de contrat** que l'adapter Drizzle, puis changer une ligne
dans le composition root. Aucun cas d'usage ni aucune route ne bouge.

Chaque port a au moins deux implémentations : la vraie (infra) et une **en mémoire** (tests
rapides des cas d'usage, démo sans base). Les deux passent la même suite de tests de contrat.

### Découpage par fonctionnalité (services bien délimités)

Le code est rangé **par fonctionnalité métier**, pas par type technique. Chaque fonctionnalité
expose une API publique (`index.ts`) ; les autres ne peuvent importer que cela.

| Fonctionnalité | Responsabilité                                   | Ne fait pas         |
| -------------- | ------------------------------------------------ | ------------------- |
| `catalog`      | catégories, produits, variantes, prix affichés   | stock, panier       |
| `lab-reports`  | lots, certificats d'analyse, taux de THC         | —                   |
| `inventory`    | quantités, réservations, décrément atomique      | prix                |
| `cart`         | panier invité / client, fusion                   | paiement            |
| `ordering`     | commande, cycle de vie, factures, rétractation   | encaissement        |
| `payments`     | session de paiement, webhook idempotent          | logique de commande |
| `accounts`     | identité, rôles, espace client, RGPD             | —                   |
| `content`      | guides, FAQ, pages légales, `llms.txt`, Markdown | —                   |
| `discovery`    | sitemap, IndexNow, flux pour moteurs et IA       | —                   |

Les fonctionnalités communiquent par leurs cas d'usage publics ou par des **événements**
(`ProductPublished` → IndexNow, `OrderPaid` → e-mail + décrément de stock), jamais en lisant
les tables d'une autre.

### Limiter les dépendances

- `packages/core` a **zéro dépendance d'exécution** (vérifié en CI sur son `package.json`).
- On préfère les API de la plateforme (`fetch`, `crypto.subtle`, `Intl`, `URL`) aux bibliothèques.
- Toute nouvelle dépendance apparaît dans le rapport de PR (poids, licence) et doit être
  justifiée dans la description de la PR.
- knip signale les dépendances et exports inutilisés ; Dependabot regroupe les mises à jour.

## Structure du dépôt

```
cbdboutique/
├─ apps/
│  ├─ web/                    Next.js — présentation uniquement
│  │  └─ src/
│  │     ├─ app/              routes (fines : appellent features/)
│  │     └─ features/<fonctionnalité>/   composants, appels API, tests
│  └─ api/                    Hono
│     └─ src/
│        ├─ routes/<fonctionnalité>.ts   HTTP + validation Zod → cas d'usage
│        └─ composition-root.ts          câblage des adapters
├─ packages/
│  ├─ core/                   métier, 0 dépendance d'exécution
│  │  └─ src/
│  │     ├─ shared/           Result, types marqués (Slug, Cents, Sku), Clock, IdGenerator
│  │     └─ <fonctionnalité>/
│  │        ├─ domain/
│  │        ├─ application/
│  │        ├─ ports/
│  │        └─ index.ts       API publique de la fonctionnalité
│  ├─ infra/                  adapters (seul paquet qui connaît les fournisseurs)
│  │  └─ src/
│  │     ├─ db-drizzle/       schéma, migrations, repositories PostgreSQL
│  │     ├─ memory/           implémentations en mémoire de tous les ports
│  │     ├─ mail-resend/  media-cloudinary/  payment-<prestataire>/  indexnow/  auth/
│  │     └─ contract-tests/   suites de tests réutilisées par chaque implémentation d'un port
│  ├─ contracts/              schémas Zod requêtes/réponses + OpenAPI
│  └─ config/                 ESLint, TypeScript, Prettier, Vitest partagés
├─ quality/                   contrôles de régression (SEO, GEO, perf), pages surveillées, budgets
└─ docs/
   ├─ plan.md
   └─ adr/                    décisions d'architecture (une par fichier, voir adr/README.md)
```

## Qualité du code (règles appliquées par l'outillage, pas par la bonne volonté)

**TypeScript** : `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noImplicitOverride`, `verbatimModuleSyntax`. Aucun `any`, aucun `as` non justifié.

**ESLint** (config partagée dans `packages/config`, erreurs bloquantes en CI) :

- `typescript-eslint` `strict-type-checked` + `stylistic-type-checked` ;
- promesses : `no-floating-promises`, `no-misused-promises` ;
- lisibilité : `complexity` ≤ 10, `max-depth` ≤ 3, `max-params` ≤ 3 (au-delà : un objet),
  `max-lines-per-function` ≤ 50, `max-lines` ≤ 300 par fichier ;
- pas d'export par défaut (sauf là où Next.js l'impose), nommage cohérent (`naming-convention`) ;
- **frontières** (`eslint-plugin-boundaries`) : `core` n'importe ni `infra` ni les apps ;
  `domain` n'importe pas `application` ; une fonctionnalité n'importe une autre que via son
  `index.ts` ; `apps/web` n'importe ni `core` ni `infra` ; pas d'import circulaire ;
- accessibilité : `jsx-a11y` en mode strict sur `apps/web`.

**Prettier** pour le format (pas de débat de style en revue).

**Clean code au quotidien** : fonctions courtes à une seule responsabilité, noms métier
(langage du domaine : lot, certificat d'analyse, réservation…), erreurs métier attendues
renvoyées sous forme de `Result` (pas d'exceptions pour le flux normal), pas de valeurs
« magiques » (constantes nommées), commentaires réservés au _pourquoi_.

**Tests** :

- `domain` : tests unitaires purs, couverture ≥ 90 % ;
- `application` : tests des cas d'usage avec les adapters **en mémoire** (rapides, sans réseau) ;
- `infra` : tests de contrat sur la branche Neon de la PR ;
- E2E Playwright sur la prévisualisation (Chromium + WebKit iPhone) avec axe-core ;
- la couverture ne peut pas baisser d'une PR à l'autre.

## Surveillance des régressions (pipeline)

Chaque PR est déployée en prévisualisation (front + API + branche Neon), puis comparée à `main`.
Un **commentaire unique** sur la PR récapitule tous les contrôles (✅ / ❌ + lien vers le détail).
Une régression **bloque la fusion** ; un changement voulu se valide en mettant à jour la
référence dans la même PR (le diff est donc visible en revue).

| Domaine             | Ce qui est vérifié                                                                                                                                                                                                      | Seuil                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Performance web     | Lighthouse mobile (3 passages, médiane) sur chaque gabarit                                                                                                                                                              | perf ≥ 95, LCP < 2,5 s, CLS < 0,1, TBT < 200 ms           |
| Poids               | JS/CSS par route, images                                                                                                                                                                                                | budget par route, + 5 Ko max vs `main` sans justification |
| Performance API     | p95 des routes clés sur la preview, nombre de requêtes SQL par route                                                                                                                                                    | p95 < 300 ms, pas de N+1                                  |
| SEO                 | par gabarit : `title`, description, canonical, `robots`, H1 unique, Open Graph, statut HTTP                                                                                                                             | identique à la référence `quality/seo-baseline.json`      |
| Données structurées | JSON-LD présent et valide par gabarit (`Product`, `Offer`, `BreadcrumbList`…)                                                                                                                                           | champs requis Google présents                             |
| Adresses            | sitemap de la preview vs production : URL disparue sans 301 = échec ; liens internes cassés ; HTML valide                                                                                                               | 0                                                         |
| GEO                 | `robots.txt` autorise les robots d'IA ; `llms.txt` contient tous les produits publiés ; versions Markdown en 200 `text/markdown` ; faits clés (prix, THC, lien du certificat) présents dans le HTML **sans JavaScript** | 0 manque                                                  |
| Accessibilité       | axe-core sur chaque gabarit                                                                                                                                                                                             | 0 violation                                               |
| Contenu             | aucune allégation de santé                                                                                                                                                                                              | 0                                                         |
| Code                | lint, types, frontières, knip, duplication (jscpd), couverture                                                                                                                                                          | 0 erreur, couverture ≥ `main`                             |

La liste des pages surveillées est dans `quality/pages.ts` : **chaque nouveau gabarit de page
s'y ajoute dans la PR qui le crée** (fait partie de la définition de « fini »).

En plus, une **surveillance planifiée** (GitHub Actions, chaque nuit) rejoue les contrôles
Lighthouse, SEO et GEO sur la production et ouvre une issue en cas de dégradation.

## Méthode de travail (pour suivre l'avancement)

- **1 ticket = 1 branche = 1 PR**, petite : ~300 lignes modifiées max hors fichiers générés.
  Au-delà, on découpe.
- Branche `feat/<epic>.<ticket>-<sujet>` (ex. `feat/6.2-product-repository`), commits conventionnels.
- Description de PR selon le modèle : **Quoi** / **Pourquoi** / **Comment tester** /
  **Captures** (si visuel) / **Nouvelles dépendances** / **Références mises à jour** (SEO, budgets).
- Chaque PR laisse le projet dans un état qui fonctionne et est déployé en prévisualisation :
  tu peux cliquer et voir le résultat.
- Je fusionne moi-même chaque PR une fois la CI verte et j'enchaîne ; tu suis via les PR et tu peux revenir sur n'importe quel ticket.

**Définition de « fini »** : CI verte (tous les contrôles ci-dessus), tests écrits, nouveau
gabarit ajouté à `quality/pages.ts`, nouveaux ports accompagnés de leur adapter en mémoire et
de leurs tests de contrat, documentation (OpenAPI / README de la fonctionnalité) à jour,
un **ADR** dans `docs/adr/` pour toute décision structurante.

## Contraintes CBD à respecter dans le code et les contenus

- **Paiement** : Stripe/PayPal refusent souvent le CBD → valider le prestataire avant le tunnel de commande (bloquant).
- **Aucune allégation de santé** (« soigne », « guérit », « anxiété »…) → contrôle automatique en CI sur les textes produits.
- **Taux de THC ≤ 0,3 %** et **analyses de laboratoire (certificats d'analyse) par lot** affichés sur chaque fiche.
- **Publicité restreinte** (Google Ads, Meta, Google Shopping) → le SEO et le GEO sont les canaux principaux.
- **Confirmation de majorité (18+)** : à décider (bonne pratique du secteur).
- **E-commerce** : CGV, droit de rétractation 14 jours, formulaire de rétractation, factures, TVA.
- **Accessibilité** : directive européenne (EAA, en vigueur depuis juin 2025) ; les micro-entreprises en sont exemptées pour les services, mais on vise la conformité quand même.

## Epics et tickets (1 ticket = 1 branche = 1 PR)

Numérotation `epic.ticket` : on peut insérer un ticket sans renuméroter les autres.

### EPIC 1 — Monorepo, outillage & CI

Ordre de réalisation : 1.1, 1.2, **1.5** (CI avant tout code applicatif), puis 1.3, 1.4, 1.10, 1.6… ; 1.11 avec l'EPIC 4.

1.1 Monorepo pnpm + Turborepo, `packages/config` : TypeScript strict partagé.
1.2 ESLint + Prettier partagés (règles « Qualité du code »), hooks Git légers (pre-commit : format des fichiers indexés ; pre-push : format, lint, types).
1.3 `apps/web` : Next.js 16 minimal (page d'accueil provisoire), jsx-a11y strict.
1.4 `apps/api` : Hono sur Cloudflare Workers (Wrangler), route `/health`, composition root vide.
1.5 CI : format, lint, types, tests, build (Turborepo + cache) ; `main` protégée (PR obligatoire, CI verte requise, squash uniquement).
1.6 Prévisualisation par PR : API (version Workers) + front (Netlify) branchés ensemble.
1.7 Playwright (Chromium + WebKit iPhone) + axe-core sur la prévisualisation.
1.8 En-têtes de sécurité (front + API, CORS strict).
1.9 commitlint, Dependabot (mises à jour groupées), modèle de PR.
1.10 `Dockerfile` de l'API : la même application Hono servie par Node (`@hono/node-server`), image construite en CI (non publiée). Version de Node alignée sur `.nvmrc`.
1.11 Docker Compose pour le développement local : PostgreSQL + API en conteneur, sans compte Neon.

### EPIC 2 — Architecture & garde-fous du code

2.1 `packages/core` : arborescence par fonctionnalité, contrôle CI « zéro dépendance d'exécution ».
2.2 Règles de frontières ESLint (core ↛ infra, domain ↛ application, imports via `index.ts`, pas de cycles) + une PR de démonstration qui échoue volontairement.
2.3 `core/shared` : `Result`, types marqués (`Slug`, `Cents`, `Sku`), ports `Clock` et `IdGenerator`.
2.4 `packages/infra` : squelette, adapters mémoire de `Clock`/`IdGenerator`, kit de tests de contrat.
2.5 Composition root de l'API (`buildContainer(env)`) + test qui vérifie que chaque port est câblé.
2.6 Couverture Vitest : seuil ≥ 90 % sur `domain`, « ne peut pas baisser » sur le reste.
2.7 knip (code / dépendances inutilisés) + jscpd (duplication) en CI.

### EPIC 3 — Surveillance des régressions (pipeline)

Mis en place sur la page d'accueil provisoire, puis étendu à chaque nouveau gabarit.
3.1 Rapport de PR unique (commentaire mis à jour à chaque exécution) + rapport des nouvelles dépendances.
3.2 Lighthouse CI sur la prévisualisation, budgets bloquants, comparaison avec `main`.
3.3 Budget de poids JS/CSS par route, comparaison avec `main`.
3.4 Référence SEO par gabarit (`quality/seo-baseline.json`) : title, description, canonical, robots, H1, Open Graph, statut HTTP.
3.5 Validation JSON-LD par gabarit (présence + champs requis).
3.6 Adresses publiées : diff des sitemaps (URL perdue sans 301 = échec), liens internes cassés, HTML valide.
3.7 Contrôles GEO : `robots.txt` (robots d'IA autorisés), complétude de `llms.txt`, versions Markdown, faits clés présents sans JavaScript.
3.8 Performance API : p95 des routes clés sur la preview, compteur de requêtes SQL par route en test (anti N+1).
3.9 Surveillance nocturne de la production (Lighthouse + SEO + GEO) → ouverture d'une issue si dégradation.

### EPIC 4 — Socle API & données

4.1 Projet Neon + intégration GitHub : une branche de base par PR (supprimée à la fusion), branchée sur la prévisualisation.
4.2 Adapter `db-drizzle` : connexion (pilote HTTP), migrations appliquées en CI. Les tables arrivent avec chaque fonctionnalité, pas toutes d'un coup.
4.3 `packages/contracts` : premiers schémas Zod + génération OpenAPI publiée.
4.4 Format d'erreur commun (`Result` métier → réponse HTTP), journalisation structurée.
4.5 Limitation de débit sur les routes sensibles.
4.6 Port `Mailer` + adapter Resend + adapter mémoire + tests de contrat.
4.7 Sauvegarde quotidienne de la base (Cron Trigger ou GitHub Actions).

### EPIC 5 — Comptes

5.1 Better Auth dans l'adapter `infra/auth`, exposé via un port `Authenticator` ; inscription + connexion e-mail / mot de passe ; cookie sur le domaine principal.
5.2 Lien magique et mot de passe oublié (via `Mailer`).
5.3 Rôle administrateur + protection des routes d'admin (API) et des pages d'admin (front).
5.4 Espace client : adresses.
5.5 Espace client : suppression du compte et export des données (RGPD).

### EPIC 6 — Catalogue

6.1 Domaine `catalog` : produit, variante, prix TTC/HT, TVA (tests unitaires).
6.2 Port `ProductRepository` + adapter mémoire + adapter Drizzle (tables catégories, produits, variantes) + tests de contrat.
6.3 API catalogue en lecture : liste et détail.
6.4 API catalogue : filtres, tri, pagination.
6.5 Design system : tokens, contrastes vérifiés, typographies auto-hébergées.
6.6 Page catégorie (filtres accessibles, URL de filtres non indexées / canonical) + ajout à `quality/pages.ts`.
6.7 Fiche produit : galerie, variantes, prix, composition + ajout à `quality/pages.ts`.
6.8 Fonctionnalité `lab-reports` : lots, certificats d'analyse, taux de THC (domaine, port, adapters) + affichage sur la fiche.
6.9 Recherche produits accessible (API + UI).
6.10 Port `MediaStorage` + adapter Cloudinary : upload admin → affichage optimisé.

### EPIC 7 — Stock, panier & commande

7.1 Domaine `inventory` : réservation, décrément atomique (transaction + contrainte) + adapter Drizzle.
7.2 Domaine + API `cart` pour les invités.
7.3 Panier du client connecté + fusion à la connexion.
7.4 UI du panier.
7.5 Livraison : modes et tarifs (à définir), adresse avec validation accessible.
7.6 Domaine `ordering` : cycle de vie d'une commande (tests unitaires).
7.7 Port `PaymentGateway` + adapter du prestataire : page de paiement hébergée.
7.8 Webhook de paiement **idempotent** (signature vérifiée) → événement `OrderPaid`.
7.9 Confirmation de commande + e-mail (réaction à `OrderPaid`).
7.10 Facture PDF + historique des commandes dans l'espace client.
7.11 Rétractation / retours (formulaire en ligne, conforme au Code de la consommation).
7.12 Libération automatique des réservations expirées (Cron Trigger).

### EPIC 8 — Administration

8.1 Produits & variantes (CRUD).
8.2 Import CSV des produits.
8.3 Stocks, lots, upload des certificats d'analyse.
8.4 Commandes : statuts, expédition, numéro de suivi.
8.5 Remboursement (via `PaymentGateway`).

### EPIC 9 — SEO

Chaque ticket met à jour la référence SEO / JSON-LD de l'EPIC 3.
9.1 Métadonnées par page + canonical.
9.2 Sitemap généré depuis l'API (produits, catégories, guides).
9.3 JSON-LD `Product` + `Offer` + `BreadcrumbList`.
9.4 JSON-LD `Organization` / `OnlineStore`, `OfferShippingDetails`, `MerchantReturnPolicy`.
9.5 Avis clients (si retenus) + `AggregateRating` (vrais avis uniquement).
9.6 Produit retiré → redirection 301 vers la catégorie (jamais de 404 sur une URL indexée).
9.7 Textes d'introduction des catégories (utiles, sans allégation de santé).

### EPIC 10 — GEO (être cité par ChatGPT, Perplexity, Claude, Gemini)

Chaque ticket étend les contrôles GEO de l'EPIC 3.
10.1 `robots.txt` : robots d'IA autorisés (OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended…).
10.2 `llms.txt` + `llms-full.txt` générés depuis l'API : catalogue, prix, teneurs, livraison, retours, FAQ.
10.3 Version Markdown de chaque fiche produit et guide (lisible directement par les IA).
10.4 Fonctionnalité `content` : guides et FAQ factuels (législation du CBD en France, lire un certificat d'analyse, fleurs / huiles / résines, conservation — sans allégation de santé).
10.5 Page « Analyses & transparence » : tous les certificats d'analyse par lot.
10.6 Port `SearchEngineNotifier` + adapter IndexNow, déclenché par `ProductPublished` / `GuidePublished` (Bing → ChatGPT).
10.7 Cohérence d'identité : mêmes nom / contacts partout (`sameAs` : réseaux, annuaires).
10.8 Bing Webmaster Tools + Google Search Console dès la mise en ligne.

### EPIC 11 — Légal & conformité

11.1 Mentions légales, CGV, politique de confidentialité, déclaration d'accessibilité.
11.2 Bandeau de consentement (repris de MNL) + test « aucun traceur sans accord ».
11.3 Contrôle CI anti-allégations de santé sur tous les contenus (intégré au rapport de PR).
11.4 Confirmation de majorité (si retenue).

### EPIC 12 — Mesure

12.1 GA4 via GTM après consentement + événements e-commerce standard (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).

### EPIC 13 — Lancement

13.1 Domaine + DNS (site + `api.`), HTTPS, Search Console, Bing, IndexNow, premier envoi du sitemap ; activation de la surveillance nocturne (3.9) sur la production.

### EPIC 14 — Portfolio (optionnel)

Hors besoin de la boutique : montre des compétences demandées en mission. À faire seulement si
NestJS revient souvent dans les missions visées. Rien n'est hébergé (0 €) : lancement via Docker Compose.

14.1 `apps/api-nest` : contrôleurs NestJS qui appellent **les mêmes cas d'usage** que `apps/api`
(même contrat Zod, mêmes tests d'API rejoués sur les deux). Prérequis : EPIC 6. Le conteneur
d'injection de NestJS reste confiné à cette application ; `core` ne change pas (ADR à écrire,
en lien avec [0004](adr/0004-injecter-les-dependances-sans-conteneur.md)).
14.2 Terraform pour l'infrastructure existante (Cloudflare, Neon, Netlify), plan affiché en CI.

## À fournir avant de démarrer

1. **Nom de la boutique** (même provisoire) → nom du dépôt et clé Jira.
2. **Catalogue** : nombre de produits, types (fleurs, huiles, résines…), variantes.
3. **Livraison** : transporteurs, tarifs, retrait.
4. **Langues** : français seul, ou aussi anglais ?
5. **Comptes clients et avis** dès le lancement ?
6. **Prestataire de paiement** acceptant le CBD (peut attendre l'EPIC 7).
7. **Dépôt GitHub** créé (vide) et son URL.
8. Comptes gratuits à créer le moment venu : Netlify (existant), Cloudflare, Neon, Cloudinary, Resend.
