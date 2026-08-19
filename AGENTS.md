# AGENTS.md

## Source d'interface obligatoire

- Avant d'implémenter ou de modifier **chaque écran ou état du parcours**, ouvrir et rendre dans un navigateur `docs/reference/formulaire-devis-reference.html`, puis retrouver la vue correspondante.
- Se baser systématiquement sur cette maquette pour les textes français, l'ordre des étapes, les branches conditionnelles, le catalogue, les règles d'estimation, le layout, les espacements, la typographie, les couleurs, les contrôles et les variantes mobile/desktop. Ne pas improviser une alternative à partir du scaffold ou des composants existants.
- La maquette est un bundle autonome qui nécessite JavaScript. C'est une référence en lecture seule : ne pas la modifier ni tenter de reformater son contenu embarqué (`biome.json` exclut `docs/reference`).
- `docs/functional-scope.md` fixe le comportement du parcours et `CONTEXT.md` son vocabulaire métier. En cas d'écart apparent avec la maquette, ne pas le résoudre silencieusement.

## Installation et exécution

- Utiliser Node `>=24` et `pnpm` `10.33.2` (versions imposées par `package.json`).
- Pour une installation neuve, respecter cet ordre :

```sh
cp .env.example .env
pnpm install
node ace generate:key
docker compose up -d postgresql
node ace migration:run
pnpm dev
```

- Créer `.env` avant Docker Compose : `compose.yml` lit directement les variables `DB_*`; PostgreSQL est exposé par défaut sur `localhost:5433`.
- `pnpm dev` lance Adonis et Vite ensemble avec HMR. Storybook se lance séparément avec `pnpm storybook` sur le port `6006`.

## Vérification

- Vérification complète : `pnpm lint`, `pnpm typecheck`, puis `pnpm test`. `pnpm typecheck` contrôle séparément le backend et `inertia/`.
- Test ciblé : `pnpm test unit --files=tests/unit/models/quote_request.spec.ts`; les filtres `--groups` et `--tests` sont aussi disponibles.
- Les tests de modèle utilisent PostgreSQL et des transactions. `.env.test` ne remplace que `SESSION_DRIVER`; la base définie dans `.env` doit donc être démarrée et migrée.
- Les suites `functional` et `browser` démarrent leur serveur HTTP via `tests/bootstrap.ts`; ne pas en lancer un manuellement.

## Architecture et code généré

- `start/routes.ts` relie les routes Adonis aux pages React de `inertia/pages/`; `inertia/app.tsx` est l'entrée cliente et applique `inertia/layouts/default.tsx` à toutes les pages.
- Côté serveur, utiliser les alias `#controllers/*`, `#models/*`, `#services/*`, etc. Côté client, utiliser `~/*` pour `inertia/*` et `@generated/*` pour `.adonisjs/client/*`.
- Ne jamais éditer `.adonisjs/**` ni `database/schema.ts`. Les registres Inertia/Tuyau sont générés par les hooks Adonis; les classes Lucid de `database/schema.ts` sont régénérées par `node ace migration:run` ou `node ace schema:generate`.
- Pour changer la base, ajouter une migration, exécuter `node ace migration:run`, puis placer uniquement les types ou comportements spécialisés dans le modèle sous `app/models/`.
- Réutiliser les primitives de `inertia/components/ui/` et les tokens Tailwind définis dans `inertia/css/app.css`; leurs valeurs proviennent déjà de la maquette.

## Invariants métier à ne pas contourner

- L'application est publique, sans compte prospect ni administration. Les fichiers `User` et les middlewares d'authentification sont du scaffold et ne définissent pas le périmètre produit.
- Une demande enregistrée conserve un instantané immuable des sélections et de l'estimation présentées; ne jamais recalculer son historique avec le catalogue courant.
- Enregistrer la demande avant la notification. Afficher la confirmation seulement après acceptation de la soumission; en cas d'échec, conserver les réponses et permettre un nouvel essai.
