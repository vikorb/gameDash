# État des lieux du Matchmaking

Ce document décrit précisément ce que fait actuellement le système de matchmaking et comment il le fait (code backend).

## Résumé global
- Le matchmaking tourne côté backend via `MatchmakingManager` (intervalle de 3s).
- Les joueurs sont représentés par la classe `Player` (`src/types/player.ts`).
- La formation des parties est effectuée par `createGame` dans `src/utils/matchmaking.ts`.
- L'API en temps réel utilise Socket.io (`src/socket.ts`) avec des événements pour joindre/laisser la file et recevoir la notification `match_found`.

## Flux principal
1. Un client émet `join_queue` avec `{ pocketbaseUserId, modeId }`.
2. Le serveur cherche l'utilisateur en base (`users` + `player_mmr`) et construit un `Player` via `getPlayerForQueue` (`src/services/playerService.ts`).
3. `MatchmakingManager.addPlayer(player)` appelle `player.enterQueue()` et ajoute le joueur à la liste locale `players`.
4. Toutes les 3s (`startLoop` -> setInterval) la méthode `tick()` tente de créer une partie en appelant `createGame(this.players, roomId, teamSize, numTeams)`.
5. Si `createGame` retourne un résultat, les joueurs concernés sont retirés de la file, joints à une room Socket.io, et l'événement `match_found` est émis dans la room.

## Classe Player (comportement important)
- `enterQueue()` : passe le `status` à `in_queue` et stocke `queueEnteringTime`.
- `exitQueue()` : remet `status` à `online`.
- `setWaiting(gameId)` : passe le joueur à `waiting` et assigne `roomId`.
- `startGame()` : passe le joueur à `in_game`.
- `cancelWaiting()` : annule l'état `waiting` et remet à `online`.

Ces états sont utilisés comme verrous optimistes pour empêcher la sélection d'un joueur déjà engagé.

## Algorithme de création de partie (`src/utils/matchmaking.ts`)
- Entrée : la liste de joueurs en file, `roomId`, `teamSize` (par défaut 4), `numTeams` (par défaut 2), `sampleSizePercent` (par défaut 0.25).
- Étapes :
  - Tri des joueurs par `queueEnteringTime` (les plus anciens en tête).
  - Calcul d'un `targetMMR` à partir d'un échantillon des joueurs les plus anciens (taille = 25% par défaut).
  - Calcul du `mmrRange` (max - min) parmi les joueurs.
  - Sélection progressive des joueurs via `selectPlayersWithTolerance` :
    - On sélectionne `totalPlayersNeeded = teamSize * numTeams` joueurs.
    - La tolérance MMR commence à ±30% du range et décroît vers ±10% au fur et à mesure du remplissage.
    - On préfère les candidats les plus proches du `targetMMR`; en l'absence de candidats, on prend le joueur ayant le plus attendu.
    - Avant d'ajouter un joueur, on appelle `setWaiting(roomId)` : si elle retourne `false`, le joueur est ignoré.
  - Si on n'a pas réussi à sélectionner assez de joueurs (p.ex. concurrents pris par d'autres processus), on annule les `waiting` et on abandonne (retourne `null`).
  - Si sélection complète : tri décroissant par MMR et distribution en équipes par rotation (pour équilibrer les totaux MMR).
  - Calcul des statistiques de balance (max/min/différence) et appel de `startGame()` sur les joueurs sélectionnés.
  - Retourne les `teams`, `createdAt` et `mmrBalance`.

## Intégration Socket.io (`src/socket.ts`)
- Événements clients gérés :
  - `join_queue` : rejoint la file (vérification DB, construction `Player`, `matchmakingManager.addPlayer`).
  - `leave_queue` : retire le joueur via `removePlayerBySocket`.
  - `simulate_matchmaking` : construit un joueur réel + ajoute immédiatement 5 bots puis 2 bots après 3s pour tester la mécanique.
  - `disconnect` : retire le joueur de la file.
- Événements émis côté serveur : `queue_joined`, `queue_left`, `queue_error`, `simulation_started`, `simulation_delayed_players`, `match_found`.

## Construction du `Player` (`src/services/playerService.ts`)
- Récupère l'utilisateur et la ligne `player_mmr` pour le `modeId` donné.
- Parse `matchmaking_pref` JSON si nécessaire.
- Actuellement, `rank` et `division` sont choisis aléatoirement (placeholder) et `mmr` par défaut à 1000 si absent.

## Points importants et limites actuelles
- Matchmaking centralisé en mémoire du processus Node (tous les joueurs stockés dans `MatchmakingManager.players`). Pas de persistance ni de coordination entre instances.
- Pas de partition par `modeId`/région/langue : la remarque dans `MatchmakingManager.tick()` indique que la séparation par game mode n'est pas encore implémentée.
- Verrous légers via les états `waiting`/`in_queue`, mais pas de garantie forte en multi-process/cluster.
- `getPlayerForQueue` utilise des valeurs factices pour `rank`/`division`.
- Aucun suivi ou journalisation détaillée des raisons d'échec (p.ex. pourquoi `createGame` a renvoyé `null` lors d'un tick).

## Fichiers clés
- [MatchmakingManager.ts](src/managers/MatchmakingManager.ts)
- [utils/matchmaking.ts](src/utils/matchmaking.ts)
- [socket.ts](src/socket.ts)
- [services/playerService.ts](src/services/playerService.ts)
- [types/player.ts](src/types/player.ts)

## Recommandations rapides (optionnelles)
- Implémenter la partition par `modeId` et éventuellement par `region` avant la sélection.
- Remplacer les rangs/divisions aléatoires par une source de vérité (base ou calcul).
- Si montée en charge prévue : externaliser la queue (Redis, BullMQ) et utiliser des verrous distribués.
- Ajouter du logging structuré pour suivre les décisions de matching et les raisons d'échec.

---
Fait automatiquement à partir du code dans `backend/src`.
