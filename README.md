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

### Installation

```bash
npm install
```

---

## ▶️ Lancement recommandé (stack complet)

> ⚠️ **Mode recommandé pour la démo et le développement**

````bash
docker compose -f docker/docker-compose.yml up --build
### Lancer le projet en développement

```bash
npm run dev
````

Cela lance automatiquement :

- PostgreSQL
- le backend API
- le frontend Vue

Accès :

- Frontend : http://localhost:5173
- API : http://localhost:3000/health
- DB : localhost:5433

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
├─ src/                      # Frontend Vue.js
│  ├─ assets/                # Styles, images, icônes
│  ├─ components/            # Composants agnostiques réutilisables
│  ├─ views/                 # Pages (1 dossier par vue)
│  ├─ router/                # Configuration Vue Router
│  ├─ stores/                # Stores Pinia
│  ├─ services/              # Accès API (HTTP)
│  ├─ types/                 # Types et interfaces TypeScript
│  ├─ utils/                 # Fonctions utilitaires
│  └─ main.ts                # Point d’entrée frontend
│
├─ backend/                  # Backend API (Node.js / Express)
│  ├─ src/
│  │  ├─ app.ts              # Point d’entrée API
│  │  ├─ db.ts               # Connexion base de données (Knex)
│  │  └─ routes/             # Routes API (ex: maps)
│  │
│  ├─ migrations/            # Migrations Knex (schéma DB)
│  ├─ knexfile.cjs           # Configuration Knex (CLI)
│  ├─ .env                   # Variables d’environnement backend
│  └─ package.json           # Dépendances backend
│
├─ docker/
│  └─ docker-compose.yml     # Orchestration DB / backend / frontend
│
├─ package.json              # Dépendances frontend
├─ eslint.config.ts          # Configuration ESLint (frontend)
├─ README.md                 # Documentation projet
└─ .gitignore
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
- Données persistées via volumes Docker

### 🐳 Docker & orchestration

- Docker Compose orchestre :
  - la base de données
  - le backend
  - le frontend
- Une seule commande permet de démarrer l’ensemble du stack :

```bash
docker compose up
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

- Chaque page = 1 dossier
- Les composants spécifiques à une page restent dans views/<Page>/components

### 3️⃣ Tests

- Le dossier tests/ reproduit exactement la structure de src/
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

- 150 lignes MAXIMUM par fichier
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

## 🧠 User Stories & Méthodologie

### User Stories

- Les User Stories définies dans le projet doivent être respectées strictement
- Une US :
  - est petite mais cohérente
  - contient fonctionnalités, tests, seeds et lien DB
- Toute évolution doit être validée par l’équipe

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

- `docker/docker-compose.yml`
- Le port interne PostgreSQL est 5432 (fixe)
- Le port 5433 est exposé sur la machine hôte pour éviter les conflits locaux
- Les données sont persistées via un volume Docker

### ▶️ Commandes Docker

- Démarrer la base de données :

```bash
docker compose -f docker/docker-compose.yml up -d
```

- Arrêter et réinitialiser complètement la base (suppression des données) :

```bash
docker compose -f docker/docker-compose.yml down -v
```

### 🔁 Migrations de base de données (Knex)

La gestion du schéma est assurée par Knex, qui permet de versionner et d’appliquer les évolutions de la base de données de manière contrôlée.

**Configuration des variables d’environnement**

Les paramètres de connexion sont définis dans :

- backend/.env

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=gamedash
DB_PASSWORD=gamedash
DB_NAME=gamedash
```

### 🧬 Création d’une migration

Depuis le dossier backend/ :

```bash
npx knex migrate:make create_maps --knexfile knexfile.cjs
```

Cette commande génère un nouveau fichier de migration dans :

- backend/migrations/

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
