# Contribuer à GameDash

Merci de contribuer à **GameDash**. Ce document décrit les règles de collaboration, de code et de workflow Git du projet. Elles sont **obligatoires** : tout écart doit être justifié et validé collectivement.

---

## 🧭 Sommaire

- [Prérequis & installation](#-prérequis--installation)
- [Méthodologie : User Stories](#-méthodologie--user-stories)
- [Workflow Git](#-workflow-git)
- [Conventions de commit](#-conventions-de-commit)
- [Règles de code](#-règles-de-code)
- [Architecture du code](#-architecture-du-code)
- [Tests](#-tests)
- [Internationalisation](#-internationalisation)
- [Base de données](#-base-de-données)
- [Checklist avant Pull Request](#-checklist-avant-pull-request)

---

## ⚙️ Prérequis & installation

- Node.js (LTS), npm, Git, Docker.
- Voir le `README.md` pour l'installation détaillée. En résumé :

```bash
git clone <url-du-repo>
cd gameDash
cp .env.example .env
npm install            # outillage local (Husky, ESLint…)
docker compose up --build
```

---

## 🧠 Méthodologie : User Stories

Chaque évolution est pilotée par une **User Story (US)** atomique et complète. Une US inclut **tout** son périmètre :

- la fonctionnalité (**frontend & backend**) ;
- le schéma de base de données (**migrations**) ;
- les données de test (**seeds**) ;
- les **tests** unitaires/intégration associés.

> Une US incomplète (par exemple une migration sans seed ni test) ne doit pas être fusionnée.

---

## 🌿 Workflow Git

Aucune modification directe sur la branche principale. Chaque US correspond à **une branche unique**.

1. Créer une branche depuis `main` (ou `develop`).
2. Développer **l'US complète** (code + DB + seeds + tests).
3. Ouvrir une **Merge/Pull Request**.
4. Vérifier que la **CI est verte** (lint, tests, qualité).
5. Obtenir la **review d'au moins un autre membre**.
6. Fusionner dans `main` après validation.

**Nomenclature des branches :**

```
feat/us-[ID]-[titre_simplifié]
# Exemple : feat/us-04-edition_map_form
```

---

## 📝 Conventions de commit

Le projet suit les **Conventional Commits**, vérifiés par **commitlint**. Un commit non conforme est refusé automatiquement.

```bash
feat: add login page
fix: prevent double queue join
chore: setup husky hooks
test: add elo calculation tests
docs: update readme
```

Préfixes courants : `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`, `ci`.

**Hooks Git (Husky) :**

- `pre-commit` : `lint`, `tests`, `lint-staged`
- `commit-msg` : validation du message de commit

---

## 📏 Règles de code

**Taille des fichiers**

- **80 lignes maximum** par fichier. Au-delà → refactorisation obligatoire.

**Nommage**

- `camelCase` pour variables, fonctions, props, méthodes.
- `PascalCase` pour les noms de composants.
- Pas d'abréviations obscures : `usr`/`tmp`/`res` ❌ → `user`/`temporaryValue`/`response` ✅.
- Noms explicites et clairs.

**Composants**

- 1 composant = 1 responsabilité.

**Bonnes pratiques (tech lead rules)**

- Pas de code mort, pas de `TODO` oubliés, pas de `console.log` en production.
- Pas de logique métier dans les composants UI.
- Pas de duplication de logique.
- Lisibilité > micro-optimisation.

---

## 🏗️ Architecture du code

**Components (`src/components/`)**

- Contient uniquement des composants **agnostiques** (réutilisables, sans appel API direct).
- Un composant utilisé au moins **2 fois** doit être déplacé ici (dossier `ui/`).

**Views (`src/views/`)**

- Chaque page métier = **un dossier** dédié.
- Les composants spécifiques à une page restent dans le dossier de cette page.

**Backend**

- Séparation stricte : **routes** ↔ **logique métier (services)** ↔ **accès base (Knex)**.
- Le backend est le **seul** point d'accès à la base ; le frontend ne parle jamais directement à la DB.

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour les diagrammes.

---

## 🧪 Tests

- Tests unitaires & d'intégration avec **Vitest** ; les appels API sont **mockés**.
- Le dossier `tests/` **reproduit exactement** la structure de `frontend/`.
- Un composant = un fichier de test correspondant.
- Toute logique métier critique **doit** être couverte.

```bash
npm run test
```

> Note : la configuration Vitest utilise `pool: 'forks'` (isolation par processus) pour un comportement déterministe entre les environnements local et CI.

---

## 🌍 Internationalisation

- Toute chaîne affichée à l'utilisateur passe par les fichiers de locales (`fr` / `en`).
- **Aucun string « en dur »** dans les composants.
- Langues supportées : **français** et **anglais**.

---

## 🗄️ Base de données

- Schéma défini sur **dbdiagram.io** (lien dans le `README`) et versionné via **migrations Knex**.
- Les données **ne sont pas persistées** : à chaque `docker compose up`, migrations + seeds sont rejouées (jeu de données propre et identique pour toute l'équipe).
- Toute donnée devant survivre **doit** être ajoutée dans une **seed** (stratégie idempotente `.onConflict().merge()`).

```bash
# Créer une migration
npx knex migrate:make create_xxx --knexfile knexfile.ts
# Appliquer les migrations
npx knex migrate:latest --knexfile knexfile.ts
# Rejouer les seeds
npx knex seed:run --knexfile knexfile.ts
```

> Les seeds sont réservées au **dev/staging** ; ne jamais exécuter en production des seeds contenant des suppressions (`.del()`).

---

## ✅ Checklist avant Pull Request

- [ ] Le fichier fait-il **moins de 80 lignes** ?
- [ ] Les nouveaux composants sont-ils en **PascalCase** ?
- [ ] `npm run lint` passe-t-il ?
- [ ] Si j'ai touché à la DB : ai-je créé **la migration ET la seed** correspondantes ?
- [ ] Les tests passent-ils (`npm run test`) ?
- [ ] Mon US est-elle **complète** (front + back + DB + seeds + tests) ?
- [ ] Mes commits respectent-ils les **Conventional Commits** ?
- [ ] Aucune **donnée sensible** ni `.env` n'est committé ?

---

## 🔐 Sécurité & qualité

- Aucune donnée sensible dans le dépôt ; variables via `.env` (et `.env.example` tenu à jour).
- Chaque PR doit **compiler**, **passer les tests** et **respecter ESLint & Prettier**.

Merci pour vos contributions ! 🎮
