# Architecture — GameDash

Ce document présente l'architecture de **GameDash** sous forme de diagrammes (Mermaid). Il complète le `README` et la documentation technique.

---

## 1. Vue d'ensemble (conteneurs)

Architecture modulaire en couches : SPA cliente, API REST stateless, base relationnelle, et service d'authentification dédié (PocketBase).

```mermaid
flowchart LR
    subgraph Client["Navigateur"]
        FE["Frontend — Vue 3 + Vite<br/>Pinia · Vue Router · vue-i18n"]
    end

    subgraph Server["Backend"]
        API["API REST<br/>Node + Express 5 + TypeScript"]
        SVC["Services métier<br/>MMR · rank · match · seasonReset"]
    end

    subgraph Data["Persistance"]
        PG[("PostgreSQL 15<br/>via Knex")]
    end

    subgraph Auth["Authentification"]
        PB["PocketBase<br/>JWT · avatars · webhooks"]
    end

    FE -- "REST /api (JSON, Bearer JWT)" --> API
    FE -- "login / upload avatar" --> PB
    API --> SVC --> PG
    API -- "auth-refresh (vérif JWT)" --> PB
    PB -- "webhook création user" --> API
```

**Principes :** séparation des services (identité PocketBase ↔ domaine PostgreSQL), découpage par domaine (maps, shop, moderation, mmr, matches, backoffice…), API stateless, données initiales déterministes (seeds). Le frontend ne parle **jamais** directement à la base ; le backend est l'unique point d'accès.

---

## 2. Flux d'authentification

```mermaid
sequenceDiagram
    autonumber
    participant FE as Frontend
    participant PB as PocketBase
    participant API as API Backend
    participant DB as PostgreSQL

    FE->>PB: Login (email / mot de passe)
    PB-->>FE: JWT
    FE->>API: Requête + Authorization: Bearer <jwt>
    API->>PB: POST /auth-refresh (validation du JWT)
    PB-->>API: Token valide (+ identité)
    API->>DB: Lookup user par pocketbase_user_id
    DB-->>API: Profil (id, role)
    API->>API: req.user = { id, role, pocketbase_user_id }
    API-->>FE: Réponse JSON
    Note over API,DB: Fallback si user non synchronisé :<br/>contexte dégradé (rôle issu de PocketBase)
```

La synchronisation des comptes est aussi assurée par un **webhook** PocketBase (`POST /api/pocketbase-webhook/users`) qui crée l'utilisateur PostgreSQL absent.

---

## 3. Cycle d'une requête API

```mermaid
flowchart TD
    A["Requête HTTP /api/..."] --> B["CORS + parsing JSON"]
    B --> C["authenticateUser<br/>(vérif JWT, req.user)"]
    C --> D["Routeur de domaine<br/>(maps / shop / moderation / ...)"]
    D --> E["asyncHandler<br/>(capture des erreurs async)"]
    E --> F{"Logique métier"}
    F -->|lecture/écriture| G[("PostgreSQL via Knex")]
    F -->|succès| H["Mapper Row → DTO"]
    H --> I["Réponse JSON normalisée"]
    F -->|exception| J["errorHandler<br/>{ error: { message, code, details } }"]
    D -.->|route inconnue| K["notFound (404 ROUTE_NOT_FOUND)"]
```

---

## 4. Domaines fonctionnels

```mermaid
flowchart TB
    subgraph Joueur["Espace joueur"]
        P1["Profil & compte"]
        P2["MMR · Rangs · Matchs"]
        P3["Boutique & inventaire"]
        P4["Maps : publication, versions,<br/>votes, tests, commentaires"]
    end
    subgraph Studio["Backoffice studio"]
        S1["Dashboard KPIs"]
        S2["Matchmaking (réglages)"]
        S3["Économie (catalogue, récompenses)"]
        S4["Modération (signalements,<br/>sanctions, appels, audit)"]
    end
    API["API REST GameDash"]
    P1 & P2 & P3 & P4 --> API
    S1 & S2 & S3 & S4 --> API
    API --> DB[("PostgreSQL")]
```

---

## 5. Chaîne CI/CD (GitLab)

Le code est hébergé sur **GitHub** (`vikorb/gameDash`) ; le pipeline s'exécute sur **GitLab CI**, qui récupère d'abord le dépôt GitHub.

```mermaid
flowchart LR
    GH["GitHub<br/>(code source)"] --> F["fetch:github<br/>clone du dépôt"]
    F --> B["build<br/>build & push images<br/>→ GitLab Registry"]
    B --> T1["test:frontend<br/>Vitest + coverage"]
    B --> T2["test:docker-compose<br/>boot de la stack"]
    T1 --> A1["analysis:sonar<br/>(SonarCloud, main)"]
    T1 --> A2["analysis:lighthouse"]
    T1 --> A3["analysis:dependencies<br/>audit / depcheck"]
    T2 --> D["deploy:azure_aci<br/>(manuel, main, OIDC)"]
    A1 -.-> D
```

Les jobs d'analyse sont informatifs (`allow_failure`) ; le déploiement est **manuel** sur `main` et conditionné à la réussite du build et des tests.

---

## 6. Déploiement (Azure Container Instances)

Déploiement sous forme d'un **container group** unique (région `germanywestcentral`) : les conteneurs partagent le réseau et communiquent via `localhost`.

```mermaid
flowchart TB
    subgraph ACI["Azure Container Instance group — IP publique (DNS: gamedash-supdevinci-2026)"]
        direction TB
        FEc["frontend :5173"]
        BEc["backend :3000"]
        PBc["pocketbase :8090"]
        DBc[("db postgres :5432")]
        BEc -- "localhost:5432" --> DBc
        BEc -- "localhost:8090" --> PBc
        FEc -- "API" --> BEc
    end
    REG["GitLab Container Registry"] -. "images :latest" .-> ACI
    AF1["Azure File — db-volume"] --- DBc
    AF2["Azure File — pocketbase-volume"] --- PBc
```

Les images proviennent de la **GitLab Container Registry** ; la persistance s'appuie sur des volumes **Azure File** ; les secrets sont injectés au déploiement (`envsubst` + variables CI/CD protégées).

> ⚠️ La base PostgreSQL est exposée publiquement (port `5432`) dans ce manifeste : à restreindre pour un usage réel (Key Vault, suppression du port public).
