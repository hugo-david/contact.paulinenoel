# Formulaire de demande de devis

Application publique en cours de développement, destinée à permettre aux prospects de Pauline Noël de qualifier leur projet, d'obtenir une estimation indicative et d'envoyer une demande de devis.

[Fonctionnalités](#fonctionnalités) · [Installation](#installation) · [Architecture](#architecture) · [Documentation](#documentation)

## Aperçu

Le parcours guide le prospect à travers les prestations adaptées à son besoin, estime leur coût et prépare une demande autonome, sans compte client ni espace d'administration. Les choix et l'estimation présentée lors de la soumission sont destinés à être conservés sous forme d'instantané immuable.

> [!NOTE]
> Le projet est en cours de développement. Le parcours d'identité et branding, son estimation et son récapitulatif sont disponibles. Les branches web, imprimé et digital, la collecte des coordonnées, la soumission, la notification par e-mail et la politique de confidentialité restent à implémenter.

## Fonctionnalités

- parcours guidé en français, responsive et accessible au clavier ;
- trois formules d'identité et branding avec estimation détaillée ;
- qualification par délai souhaité ;
- majoration de 20 % pour les demandes express ;
- modèle PostgreSQL conçu pour archiver les sélections et estimations sans recalcul historique ;
- composants d'interface documentés dans Storybook ;
- tests unitaires, de modèle et de parcours navigateur.

L'estimation reste indicative et ne constitue pas un devis contractuel.

## Stack technique

- [AdonisJS 7](https://adonisjs.com/) et [Lucid](https://lucid.adonisjs.com/) ;
- [React 19](https://react.dev/) avec [Inertia.js 3](https://inertiajs.com/) ;
- [PostgreSQL 17](https://www.postgresql.org/) ;
- [Tailwind CSS 4](https://tailwindcss.com/) et [Vite 8](https://vite.dev/) ;
- [TypeScript](https://www.typescriptlang.org/), [Biome](https://biomejs.dev/), [Japa](https://japa.dev/) et [Storybook](https://storybook.js.org/).

## Prérequis

- [Node.js](https://nodejs.org/) 24 ou version ultérieure ;
- [pnpm](https://pnpm.io/) 10.33.2 ;
- [Docker](https://www.docker.com/) avec Docker Compose.

## Installation

Depuis la racine du dépôt :

```bash
cp .env.example .env
pnpm install
node ace generate:key
docker compose up -d postgresql
node ace migration:run
pnpm dev
```

L'application est ensuite disponible sur [http://localhost:3333](http://localhost:3333).

> [!IMPORTANT]
> Créez `.env` avant de lancer Docker Compose : `compose.yml` lit directement les variables `DB_*`. Par défaut, PostgreSQL est exposé sur `localhost:5433`.

Pour arrêter l'environnement local :

```bash
docker compose down
```

Ajoutez `--volumes` uniquement si vous souhaitez également supprimer les données PostgreSQL locales.

## Développement

| Commande | Usage |
| --- | --- |
| `pnpm dev` | Lance AdonisJS et Vite avec rechargement à chaud sur le port `3333`. |
| `pnpm storybook` | Lance le catalogue de composants sur le port `6006`. |
| `pnpm lint` | Analyse le code avec Biome. |
| `pnpm format` | Formate les fichiers avec Biome. |
| `pnpm typecheck` | Vérifie séparément les types du backend et de l'application React. |
| `pnpm test` | Exécute toutes les suites Japa. |
| `pnpm build` | Génère l'application de production dans `build/`. |
| `pnpm build-storybook` | Génère le Storybook statique dans `storybook-static/`. |

### Vérifications

La vérification complète s'exécute dans cet ordre :

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Les tests de modèle utilisent PostgreSQL et des transactions. La base configurée dans `.env` doit être démarrée et migrée avant de les lancer. Les suites fonctionnelles et navigateur démarrent elles-mêmes leur serveur HTTP.

Pour exécuter un test ciblé :

```bash
pnpm test unit --files=tests/unit/models/quote_request.spec.ts
```

## Configuration

Le fichier [`.env.example`](./.env.example) fournit les valeurs de développement attendues :

| Groupe | Variables |
| --- | --- |
| Serveur | `NODE_ENV`, `HOST`, `PORT`, `LOG_LEVEL` |
| Application | `APP_KEY`, `APP_URL` |
| Session | `SESSION_DRIVER` |
| PostgreSQL | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` |

`APP_KEY` doit être générée avec `node ace generate:key` et ne doit jamais être versionnée.

## Architecture

```text
app/                 Modèles, middlewares et gestion des exceptions AdonisJS
config/              Configuration du serveur, de la sécurité et des services
database/            Migrations PostgreSQL et schéma Lucid généré
docs/                Périmètre fonctionnel, modèle métier, ADR et maquette
inertia/             Pages React, parcours métier, composants UI, styles et polices
start/               Routes, validation de l'environnement et pile HTTP
tests/               Tests unitaires, de modèle et navigateur
```

La route publique `GET /` rend la page Inertia `home`. Le parcours actuel conserve ses réponses dans l'état React et délègue le calcul à une fonction métier pure. Le modèle `QuoteRequest` et la table `quote_requests` préparent la persistance future des coordonnées, sélections, lignes d'estimation et états de notification.

> [!WARNING]
> `database/schema.ts` et `.adonisjs/` sont générés par AdonisJS et ne doivent pas être modifiés manuellement. Toute évolution de la base passe par une nouvelle migration.

## Production

Créez l'artefact optimisé avec :

```bash
pnpm build
```

Le dossier `build/` contient l'application compilée et son propre `package.json`. Un environnement de production doit fournir les variables validées par `start/env.ts`, une instance PostgreSQL accessible, installer les dépendances de production, exécuter les migrations puis démarrer l'application depuis cet artefact.

## Documentation

- [`CONTEXT.md`](./CONTEXT.md) : vocabulaire métier de référence ;
- [`docs/functional-scope.md`](./docs/functional-scope.md) : parcours cible, catalogue et règles fonctionnelles ;
- [`docs/data-model.md`](./docs/data-model.md) : agrégat et cycle de vie d'une demande ;
- [`docs/database-schema.md`](./docs/database-schema.md) : structure et contraintes PostgreSQL ;
- [`docs/adr/`](./docs/adr/) : décisions d'architecture ;
- [`docs/reference/formulaire-devis-reference.html`](./docs/reference/formulaire-devis-reference.html) : maquette interactive de référence, en lecture seule.

La maquette HTML et le périmètre fonctionnel sont les sources de vérité pour toute nouvelle étape du parcours. En cas d'écart apparent entre eux, la décision doit être explicitée plutôt que résolue silencieusement.
