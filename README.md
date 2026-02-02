# GameDash (Vue.js)

## 📌 Présentation du projet

GameDash est une application web développée en **Vue.js** dans le cadre d’un projet académique annuel (M2 DEV Full-Stack).  
Le projet est réalisé en **équipe de 3**, avec un fort accent sur :

- la qualité du code,
- la maintenabilité,
- les bonnes pratiques professionnelles,
- et la conformité au cahier des charges.

---

## 🧱 Stack technique

- **Vue.js 3**
- **Vite**
- **TypeScript**
- **Vue Router**
- **Pinia**
- **npm**
- **ESLint + Prettier**
- **Vitest** (tests unitaires & intégration)
- **Husky + commitlint + lint-staged**
- **GitHub Actions (CI)**

---

## 🚀 Installation & lancement

### Prérequis

- Node.js (version LTS recommandée)
- npm
- Git

### Installation

```bash
npm install
```

---

## Lancer le projet en développement

```bash
npm run dev
```

---

## Scripts disponibles

```bash
npm run dev        # serveur de dev
npm run build      # build production
npm run preview    # preview du build
npm run lint       # lint global
npm run format     # formatage prettier
npm run test       # tests unitaires & intégration
```

---

## 🧩 Organisation du projet

### Arborescence générale

```bash
.
├── assets/
│   ├── css/          # styles globaux
│   ├── icons/        # icônes
│   └── images/
│
├── src/
│   ├── components/   # composants agnostiques et réutilisables
│   ├── locales/
│   │   ├── fr/
│   │   └── en/
│   ├── router/       # configuration des routes
│   ├── stores/       # Pinia stores
│   ├── types/        # types TypeScript / DTO
│   ├── utils/        # helpers, fonctions utilitaires
│   ├── views/        # pages (1 dossier = 1 page)
│   │   └── Login/
│   │       ├── LoginView.vue
│   │       └── components/
│   ├── App.vue
│   └── main.ts
│
├── tests/            # structure miroir de src/
├── .husky/
├── .github/
└── README.md
```

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
- Aucune string “en dur” dans les composants
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
