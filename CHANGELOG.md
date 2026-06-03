# Changelog

Tous les changements notables de **GameDash** sont documentés dans ce fichier.

Le format s'appuie sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet suit le [Versionnage Sémantique](https://semver.org/lang/fr/).

> ℹ️ À compléter par l'équipe au fil des versions. Les dates sont indicatives et
> peuvent être ajustées selon les tags Git réels.

---

## [Unreleased]

### À venir

- Branchement sur le jeu réel (source de données live) en remplacement des seeds.
- Canal temps réel (WebSocket) pour le matchmaking et le monitoring.
- Intégration d'un PSP sandbox réel (Stripe/PayPal) pour le rechargement.
- Saisons compétitives et récompenses créateurs ; notifications in-app/email.

---

## [1.0.0] - 2026-06-01

Première version complète : produit V1 fonctionnel (frontend + backend), parcours
joueur et backoffice studio opérationnels de bout en bout.

### Added — Socle & infrastructure

- Monorepo front + back, orchestration **Docker Compose** (PostgreSQL, PocketBase, backend, frontend).
- Liaison back/front (client HTTP, contrat d'API), `.env.example` de référence.
- **Pipeline CI/CD GitLab** (fetch GitHub → build images → tests → analyses → deploy)
  et **déploiement Azure Container Instances** (OIDC, volumes Azure File).
- Contrôles qualité : **SonarCloud**, **Lighthouse CI**, audit de dépendances.
- Outillage : ESLint, Prettier, oxlint, **Husky + commitlint + lint-staged**.
- Documentation : `README`, **Swagger/OpenAPI**, `CONTRIBUTING`, `CHANGELOG`,
  schémas d'architecture et de base de données.

### Added — Authentification & comptes

- Authentification **PocketBase (JWT)** avec profil enrichi côté PostgreSQL.
- Rôles `player` / `staff` / `admin` ; webhook de synchronisation des comptes.
- **Gestion du profil** : édition, avatar, mot de passe, suppression (soft delete).

### Added — Compétitif

- **MMR par mode** (`player_mmr`) historisé, mapping MMR → rang.
- Progression par **XP / rangs / divisions** ; historique de matchs.
- **Reset de saison MMR** (soft reset transactionnel + audit).

### Added — Maps (UGC)

- Cycle de vie complet : publication, **éditeur de grille 14×14**, statuts
  (brouillon / bêta / stable), **versionnage** avec notes de version.
- Interactions : **votes** (like/dislike), **favoris**, **tests**, **commentaires**
  (et likes), **score de popularité** et statistiques par map/créateur.

### Added — Boutique & économie

- Catalogue **articles** & **bundles**, **portefeuille** (soft/hard), **inventaire**,
  **équipement** par slot.
- **Achats transactionnels** (contrôle de solde, anti-doublon) et **rechargement** simulé.
- Backoffice économie : CRUD catalogue, **paramétrage des récompenses**, audit.

### Added — Backoffice studio

- **Dashboard KPIs** (joueurs actifs, matchs/jour, revenus virtuels),
  distribution des rangs, top maps & créateurs, flux d'activité.
- Paramétrage des **files de matchmaking** par mode.

### Added — Modération

- **Signalements**, **contenus** (revue/masquage/restauration),
  **sanctions** (activation/révocation), **appels** (info/accept/reject),
  **journal d'audit** — UX homogène carte + modale.

### Notes / Limites connues

- **Pas de temps réel** : matchmaking live et monitoring non branchés (jeu amont absent).
- Modèle de données et **format des maps** établis par hypothèse, faute de
  spécifications du jeu réel (non fourni dans le cadre du projet).
- Données initiales fournies par **seeds déterministes** (réinitialisées à chaque démarrage).

---

[Unreleased]: https://github.com/vikorb/gameDash/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/vikorb/gameDash/releases/tag/v1.0.0
