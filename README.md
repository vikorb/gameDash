# GameDash

## 📌 Présentation du projet

GameDash est une application web développée en **Vue.js** dans le cadre d’un projet académique annuel (M2 DEV Full-Stack).  
Le projet est réalisé en **équipe de 3**, avec un fort accent sur :

- la qualité du code,
- la maintenabilité,
- les bonnes pratiques professionnelles,
- et la conformité au cahier des charges.

---

## 🧱 Stack technique

### Frontend

- **Vue.js 3**
- **Vite**
- **TypeScript**
- **Vue Router**
- **Pinia**

### Backend

- **Node.js**
- **Express**
- **Knex**
- **PostgreSQL**

### Qualité & outillage

- **npm**
- **ESLint + Prettier**
- **Vitest** (tests unitaires & intégration)
- **Husky + commitlint + lint-staged**
- **GitHub Actions (CI)**
- **Docker & Docker Compose**

---

## 🚀 Installation & lancement

### Prérequis

- Node.js (version LTS recommandée)
- npm
- Git
- Docker

### Installation rapide

1. Cloner le repo

```bash
git clone <url-du-repo>
cd gameDash
```

2. **Configuration des variables d'environnement**

Les variables ont été **regroupées** dans un seul fichier de référence :

```bash
cp .env.example .env
```

**Utilisation selon votre mode de lancement :**

- **Docker Compose** : les valeurs par défaut sont dans `docker-compose.yml`. Modifiez-les si besoin.
- **Lancement local (sans Docker)** : répartissez les variables de `.env` dans :
  - `backend/.env` (API)
  - `frontend/.env.local` (variables `VITE_*`)

**⚠️ Important :** Mettez à jour les valeurs PocketBase si vous ne les laissez pas par défaut :

- `POCKETBASE_ADMIN_EMAIL` : Email admin
- `POCKETBASE_ADMIN_PASSWORD` : Mot de passe admin (min 8 caractères)
- `POCKETBASE_ENCRYPTION_KEY` : Clé secrète (min 32 caractères)

Configuration des missions quotidiennes :

- `DAILY_TASKS_COUNT` : nombre de missions du jour affichées (par défaut 3), sélectionnées automatiquement chaque jour.
- `DAILY_TASKS_RANK_SCALING_ENABLED` : active l'adaptation de la difficulté des objectifs selon le rang du joueur.
- `DAILY_TASK_DIFFICULTY_STEP` : incrément de difficulté par palier de rang (ex: `0.15` = +15% par rang).
- `DAILY_TASK_DIFFICULTY_MAX_MULTIPLIER` : plafond du multiplicateur de difficulté (ex: `2` = maximum x2).

3. Installer les dépendances (pour l'outillage local : husky, eslint)

```bash
npm install
```

4. Lancer toute la stack (DB + API + Front + PocketBase)

```bash
docker compose up --build
```

### 🔑 Accès aux services

Une fois la stack lancée :

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:3000/api
- **PocketBase API** : http://localhost:8090/api
- **PocketBase Admin** : http://localhost:8090/\_/
- **Database PostgreSQL** : localhost:5432

Pour vous connecter à PocketBase Admin, utilisez les credentials définis dans `docker-compose.yml` (ou votre `.env` si vous les surchargez).

---

## ▶️ Lancement recommandé (stack complet)

> ⚠️ **Mode recommandé pour la démo et le développement**

````bash
docker compose up --build

```bash
npm run dev
````

Cela lance automatiquement :

- PostgreSQL
- PocketBase (authentification)
- le backend API
- le frontend Vue

Accès :

- Frontend : http://localhost:5173
- API : http://localhost:3000/api
- PocketBase : http://localhost:8090
- DB : localhost:5432

#### Scripts disponibles (lancement manuel)

```bash
npm run dev        # serveur de dev
npm run build      # build production
npm run preview    # preview du build
npm run lint       # lint global
npm run format     # formatage prettier
npm run test       # tests unitaires & intégration
```

---

## 🏗️ Architecture du projet

Le projet **GameDash** est structuré sous la forme d’un **monorepo** avec une séparation claire entre le **frontend**, le **backend** et l’**infrastructure**.  
Cette organisation permet une meilleure lisibilité, une montée en charge progressive et une intégration facilitée dans une CI/CD.

---

### 📁 Arborescence globale

```txt
gameDash/
├── frontend/                # Application Vue.js 3
│   ├── src/
│   │   ├── assets/          # Styles globaux (main.css), images
│   │   ├── components/
│   │   │   └── ui/          # Composants agnostiques (BaseButton, BaseCard)
│   │   ├── views/           # Pages de l'application (Home, MapsList, MapForm)
│   │   ├── router/          # Configuration Vue Router
│   │   ├── stores/          # Gestion d'état Pinia (mapStore)
│   │   ├── api/             # Configuration Axios / Intercepteurs
│   │   ├── types/           # Interfaces TypeScript (GameMap, MapStatus)
│   │   ├── utils/           # Helpers (formatage, gestion d'erreurs)
│   │   └── main.ts          # Point d’entrée Vue
│   ├── Dockerfile           # Build de l'image frontend
│   └── package.json
│
├── backend/                 # API Node.js / Express
│   ├── src/
│   │   ├── database/        # Configuration Knex & Database
│   │   │   ├── migrations/  # Schémas de tables
│   │   │   └── seeds/       # Données de test (01_maps.ts)
│   │   ├── routes/          # Endpoints API (maps.ts)
│   │   ├── types/           # Types partagés ou spécifiques au back
│   │   └── index.ts         # Point d’entrée serveur
│   ├── Dockerfile           # Build de l'image backend
│   ├── knexfile.ts          # Configuration Knex (CLI & App)
│   └── package.json
│
├── pocketbase/              # Service PocketBase
├── sonarqube/               # Stack SonarQube locale
├── docker-compose.yml       # Orchestration DB, Backend et Frontend
├── .env.example             # Variables de référence
└── README.md                # Documentation du projet
```

### 🎨 Frontend (Vue.js)

- Application Vue 3 avec Composition API
- Build et dev server via Vite
- Navigation gérée par Vue Router
- État global via Pinia
- Communication avec le backend via des services HTTP
- Typage strict avec TypeScript
- Tests unitaires et d’intégration avec Vitest
  ➡️ Le frontend ne communique jamais directement avec la base de données.

### ⚙️ Backend (API)

- API Node.js / Express
- Exposition d’endpoints REST (/maps, etc.)
- Accès base de données via Knex
- Schéma versionné par migrations
- Migrations appliquées automatiquement au démarrage
- Séparation claire entre :
  - routes
  - logique métier
  - accès base de données
    ➡️ Le backend est le seul point d’accès à la base de données.

### 🐘 Base de données

- PostgreSQL exécuté via Docker
- Schéma global défini sur dbdiagram.io
- Versionnage du schéma via Knex migrations
- **Persistance :** Attention, par choix de développement, les données ne sont **pas persistées** sur le disque hôte entre deux `docker compose down`.
- **Cycle de vie :** À chaque redémarrage (`up`), la base est réinitialisée : les migrations sont rejouées et les **seeds sont injectées automatiquement**.
- **Pourquoi ce choix ?** Cela garantit que toute l'équipe travaille en permanence sur un schéma et un jeu de données identiques et "propres".

### 🐳 Docker & orchestration

- Docker Compose orchestre :
  - la base de données
  - le backend
  - le frontend
- Une seule commande permet de démarrer l’ensemble du stack :

```bash
docker compose up --build
```

- Environnement reproductible pour :
  - développement local
  - démonstration
  - CI

---

## 📄 Règles d’architecture

### 1️⃣ Components

- src/components contient uniquement des composants agnostiques
- Si un composant est utilisé au moins 2 fois, il doit être déplacé ici
- Aucun appel API direct dans les composants agnostiques

### 2️⃣ Views

- Chaque page métier = 1 dossier lui correspondant
- Les composants spécifiques à une page vont dans le dossier correspondant à la page

### 3️⃣ Tests

- Le dossier tests/ reproduit exactement la structure de frontend/
- Un composant = un fichier de test correspondant
- Les tests sont obligatoires pour toute logique métier

---

## 🧪 Tests

- Tests unitaires & d’intégration avec Vitest
- Les appels API sont mockés
- Tout nouveau code critique doit être couvert

---

## 📏 Règles de code (obligatoires)

### Taille des fichiers

- 80 lignes MAXIMUM par fichier
- Au-delà → refactorisation obligatoire

### Nommage

- camelCase pour :
  - variables
  - fonctions
  - props
  - méthodes

- Pas d’abréviations obscures
  ❌ usr, tmp, res
  ✅ user, temporaryValue, response

- Nom de variables claires

### Composants

- Nom des composants en PascalCase
- 1 composant = 1 responsabilité

---

## 🌍 Internationalisation

- Toutes les chaînes affichées à l’utilisateur doivent passer par locales/
- Aucun string “en dur” dans les composants
- Langues supportées :
  - Français
  - Anglais

---

## 🧠 Méthodologie

### User Stories

Le projet suit une approche rigoureuse où chaque évolution est pilotée par une User Story. Une US doit être atomique et complète.

- Périmètre d'une US : Chaque US doit inclure :
  - La fonctionnalité (Frontend & Backend).
  - Le schéma de base de données (Migrations).
  - Les données de test (Seeds).
  - Les tests unitaires ou d'intégration associés.

### Workflow Git & Nomenclature

Chaque User Story correspond strictement à une branche unique. Aucune modification n'est effectuée directement sur la branche principale.

- Nomenclature des branches : feat/us-[ID]-[TITRE_SIMPLIFIÉ] : _Exemple : feat/us-04-edition_map_form_

- Cycle de vie :
  - Création de la branche à partir de main ou develop.
  - Développement complet (Code + DB + Seeds).
  - Validation par l'équipe via une Merge Request (MR).
  - Fusion (Merge) dans main après validation.

---

## 🗄️ Base de données

### Schéma

- Le schéma de la base est défini via dbdiagram.io
- 👉 Lien du diagramme DB : [CLIQUER ICI](https://dbdiagram.io/d/gameDash-6950178f39fa3db27ba3cd58)
- La DB est pensée pour :
  - Elo / MMR
  - matchmaking
  - maps versionnées (diff Git-like)
  - économie
  - audit & modération

#### Configuration Docker

La base est définie dans le fichier suivant :

- `docker-compose.yml`
- Le port interne PostgreSQL est 5432 (fixe)
- Le port 5432 est exposé sur la machine hôte pour éviter les conflits locaux
- Les données ne sont pas persistées via un volume Docker (réinitialisation après `docker compose down -v`)

### ▶️ Commandes Docker

- Démarrer la base de données :

```bash
docker compose up --build
```

- Arrêter et réinitialiser complètement la base (suppression des données) :

```bash
docker compose down -v
```

### 🔁 Migrations de base de données (Knex)

La gestion du schéma est assurée par Knex, qui permet de versionner et d’appliquer les évolutions de la base de données de manière contrôlée.

**Configuration des variables d’environnement**

Les paramètres de connexion sont définis dans :

- backend/.env

```env
DATABASE_URL=postgres://user:root@localhost:5432/gameDash
PORT=3000
NODE_ENV=development
```

### 🧬 Création d’une migration

Depuis le dossier backend/src :

```bash
npx knex migrate:make create_maps --knexfile knexfile.cjs
```

Cette commande génère un nouveau fichier de migration dans :

- backend/src/migrations/

### ▶️ Exécution des migrations

Appliquer les migrations :

```bash
npx knex migrate:latest --knexfile knexfile.cjs
```

Résultat attendu :

```bash
Batch 1 run: 1 migrations
```

Knex crée automatiquement les tables internes suivantes :

- knex_migrations
- knex_migrations_lock

### 🔌 API (extrait)

Endpoints disponibles

- GET /health → status API
- GET /maps → liste des maps
- POST /maps → création d’une map

Le backend est l’unique point d’accès à la base.

### 🌱 Données de test (Seeds)

Les Seeds permettent de peupler la base de données avec des données de test cohérentes dès le lancement du projet. Elles sont essentielles pour garantir que chaque développeur travaille sur le même jeu de données.

**Emplacement des fichiers**

Les scripts de peuplement se trouvent dans :

- backend/src/database/seeds/

**Exécution automatique (Docker)**

Le conteneur Backend attend que la DB soit prête, puis exécute systématiquement :

1. knex migrate:latest (Mise à jour du schéma)
2. knex seed:run (Injection des données de test)

**⚠️ Important** : Toute donnée ajoutée manuellement en base via un client SQL sera perdue au prochain `docker compose down`. Si une donnée doit survivre, ajoutez-la dans un fichier de seed.

**Stratégie d'Idempotence**

Pour éviter les erreurs de doublons lors des redémarrages successifs, les seeds utilisent la clause .onConflict().merge(). Cela permet de mettre à jour les données existantes plutôt que de tenter une insertion en double.

**Exécution manuelle**

Si vous avez besoin de rejouer les seeds manuellement depuis le dossier backend/ :

```Bash
# Pour peupler la base avec les données initiales
npx knex seed:run --knexfile knexfile.ts
```

**Création d'une nouvelle Seed**

Pour générer un nouveau fichier de données (ex: pour les utilisateurs) :

```Bash
npx knex seed:make 02_users --knexfile knexfile.ts
```

**💡 Rappel de sécurité**

Les seeds sont destinées exclusivement aux environnements de développement et de staging. Elles ne doivent jamais être exécutées telles quelles en production si elles contiennent des commandes de suppression (.del()).

---

## 🧾 Git & conventions

### Commits

Le projet utilise Conventional Commits (vérifiés par commitlint).

Exemples valides :

```bash
feat: add login page
fix: prevent double queue join
chore: setup husky hooks
test: add elo calculation tests
docs: update readme
```

Un commit non conforme est refusé automatiquement.

### Hooks Git

- pre-commit :
  - lint
  - tests
  - lint-staged
- commit-msg :
  - validation du message

---

## ✅ Bonnes pratiques attendues (tech lead rules)

- Pas de code mort
- Pas de TODO oubliés
- Pas de console.log en production
- Pas de logique métier dans les composants UI
- Pas de duplication de logique
- Lisibilité > micro-optimisation
- Chaque PR doit :
  - compiler
  - passer les tests
  - respecter ESLint & Prettier

---

## 🔐 Sécurité & qualité

- Aucune donnée sensible dans le repo
- Variables d’environnement via .env
- .env.example obligatoire

---

## 🧭 Workflow d’équipe recommandé

1. Créer une branche feat/<nom>
2. Développer + tests
3. Commit(s) conformes
4. Pull Request
5. CI verte
6. Review par au moins 1 membre
7. Merge

### Avant de pousser votre PR, vérifiez :

- [ ] Le fichier fait-il moins de 80 lignes ?
- [ ] Les nouveaux composants sont-ils en PascalCase ?
- [ ] Est-ce que `npm run lint` passe ?
- [ ] Si j'ai touché à la DB, ai-je créé la migration ET la seed correspondante ?
- [ ] Les tests passent-ils toujours (`npm run test`) ?

---

## 🏁 Conclusion

Ce projet vise un niveau professionnel :

- architecture claire,
- règles strictes,
- code maintenable,
- travail d’équipe structuré.

Tout écart aux règles doit être justifié et validé collectivement.

## Collaborateurs

Victoria Oruba
Cyrille Franck
Dragan Ribes
