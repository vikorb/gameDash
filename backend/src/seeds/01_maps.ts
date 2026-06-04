// ────────────────────────────────────────────────────────────────────────────
// seeds/01_maps.ts – Données de démonstration pour le module Maps
//
// Génération déterministe via mulberry32 (seed 20251227)
// Screenshots : URLs picsum.photos avec seeds stables (pas d'upload PocketBase
//               en seed → les URLs picsum jouent le rôle de mock stable)
// ────────────────────────────────────────────────────────────────────────────

import type { Knex } from "knex";

// ── PRNG déterministe (identique au frontend) ─────────────────────────────────
function mulberry32(seed: number): () => number {
  return function nextRandom(): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20251227);

function rand(): number {
  return rng();
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  const item = arr[Math.floor(rand() * arr.length)];

  if (item === undefined) {
    throw new Error("Cannot pick a value from an empty array.");
  }

  return item;
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];

  for (let i = 0; i < n && copy.length > 0; i += 1) {
    const idx = Math.floor(rand() * copy.length);
    const [item] = copy.splice(idx, 1);

    if (item !== undefined) {
      result.push(item);
    }
  }

  return result;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function toNumberId(value: unknown, context: string): number {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  throw new Error(`${context}: invalid returned id.`);
}

function extractReturnedId(row: unknown, context: string): number {
  if (typeof row !== "object" || row === null || !("id" in row)) {
    throw new Error(`${context}: insert did not return an id row.`);
  }

  return toNumberId((row as { id?: unknown }).id, context);
}

function extractReturnedIds(result: unknown, context: string): number[] {
  if (!isUnknownArray(result)) {
    throw new Error(`${context}: insert did not return an array.`);
  }

  return result.map((row, index) => extractReturnedId(row, `${context}[${index}]`));
}

async function insertReturningId(
  knex: Knex,
  tableName: string,
  data: Record<string, unknown>,
  context: string,
): Promise<number> {
  const result: unknown = await knex(tableName).insert(data).returning("id");
  const id = extractReturnedIds(result, context)[0];

  if (id === undefined) {
    throw new Error(`${context}: insert returned no id.`);
  }

  return id;
}

async function insertReturningIds(
  knex: Knex,
  tableName: string,
  data: readonly Record<string, unknown>[],
  context: string,
): Promise<number[]> {
  const result: unknown = await knex(tableName).insert(data).returning("id");

  return extractReturnedIds(result, context);
}

// ── Données de base ───────────────────────────────────────────────────────────

const TAGS = [
  { slug: "pvp", label_fr: "PvP", label_en: "PvP" },
  { slug: "coop", label_fr: "Coopératif", label_en: "Co-op" },
  { slug: "speedrun", label_fr: "Speedrun", label_en: "Speedrun" },
  { slug: "exploration", label_fr: "Exploration", label_en: "Exploration" },
  { slug: "puzzle", label_fr: "Puzzle", label_en: "Puzzle" },
  { slug: "survival", label_fr: "Survie", label_en: "Survival" },
  { slug: "deathmatch", label_fr: "Deathmatch", label_en: "Deathmatch" },
  { slug: "beginner", label_fr: "Débutant", label_en: "Beginner" },
  { slug: "competitive", label_fr: "Compétitif", label_en: "Competitive" },
  { slug: "maze", label_fr: "Labyrinthe", label_en: "Maze" },
] satisfies readonly Record<string, string>[];

// IDs des joueurs existants.
// Si les users n'existent pas encore, la seed les crée.
const CREATORS = [
  { id: 10, username: "NightOwl", region: "EU-West" },
  { id: 11, username: "StormRunner", region: "EU-East" },
  { id: 12, username: "PixelHawk", region: "NA-West" },
  { id: 13, username: "ShadowByte", region: "NA-East" },
  { id: 14, username: "NeonViper", region: "Asia" },
  { id: 15, username: "IronClad", region: "EU-West" },
  { id: 66, username: "VortexAlpha", region: "EU-West" }, // utilisateur "moi" du frontend
] as const;

const STATUSES = ["draft", "beta", "stable"] as const;
const MOD_STATUSES = ["visible", "visible", "visible", "hidden"] as const; // 75% visible

type MapStatus = (typeof STATUSES)[number];
type ModerationStatus = (typeof MOD_STATUSES)[number];

const MAP_TITLES = [
  "Dark Labyrinth",
  "Crimson Fortress",
  "Neon Descent",
  "Frozen Citadel",
  "Obsidian Plains",
  "The Corridor",
  "Skybridge Arena",
  "Ember Keep",
  "Shadow Crossing",
  "Void Chamber",
  "Iron Maze v2",
  "Coastal Strike",
  "Reactor Core",
  "Ruins of Eternity",
  "Fractured Heights",
  "The Gauntlet",
  "Storm Peak",
  "Underground Nexus",
  "Prism Tower",
  "Ancient Depths",
] as const;

const MAP_DESCRIPTIONS = [
  "Un labyrinthe complexe conçu pour les affrontements rapides en 4v4. La verticalité est clé.",
  "Forteresse symétrique idéale pour les tournois compétitifs. Chaque couloir est équilibré.",
  "Une map futuriste aux lignes néon. Les rotations sont rapides et les angles imprévisibles.",
  "Citadelle glacée avec zones de couverture naturelles et passages secrets.",
  "Terrain ouvert hostile avec peu de couvertures. Réservé aux joueurs expérimentés.",
  "Le couloir – simple dans sa conception, brutal dans son exécution. Pur deathmatch.",
  "Deux tours reliées par des passerelles. Le contrôle de la hauteur est primordial.",
  "Donjon médiéval reconfiguré pour le gameplay moderne. Ambiance sombre garantie.",
  "Map de transit avec multiples points de croisement. Parfait pour les embuscades.",
  "Chambre centrale ouverte entourée de salles latérales. Dynamique unique.",
  "Refonte complète du Labyrinthe de Fer avec nouvelles routes et spawns rééquilibrés.",
  "Littoral avec combats dynamiques entre la plage, les falaises et les bunkers.",
  "Cœur d'un réacteur en fusion. La pression monte rapidement.",
  "Ruines d'une ancienne civilisation. Architecture labyrinthique naturelle.",
  "Falaises fracturées créant des plateformes multiples à hauteurs variées.",
  "L'épreuve ultime – 16 salles de défis enchaînées. Seuls les meilleurs survivent.",
  "Sommet balayé par les vents avec visibilité maximale. Sniper paradise.",
  "Réseau souterrain dense. Combat rapproché inévitable.",
  "Tour prismatique avec rotations verticales. Unique en son genre.",
  "Profondeurs marines reconverties. Pression et obscurité au programme.",
] as const;

const RELEASE_NOTES_V1 = [
  "Version initiale – layout de base fonctionnel.",
  "Première publication après tests internes.",
  "Release candidate – quelques ajustements de spawn à venir.",
  "Alpha publique. Retours bienvenus.",
  "Version jouable, encore en finition.",
] as const;

const RELEASE_NOTES_V2 = [
  "Rééquilibrage des spawns et correction de la hitbox mur nord.",
  "Ajout de couvertures supplémentaires en zone centrale. Nouveau chemin secondaire.",
  "Fix des angles de tir exploitables. Optimisation générale.",
  "Refonte complète de la moitié est de la map suite aux retours communautaires.",
  "Amélioration de la lisibilité visuelle. Passages secrets bouchés.",
] as const;

const RELEASE_NOTES_V3 = [
  "Rééquilibrage définitif avant passage en Stable. Map validée pour la compétition.",
  "Corrections mineures de collisions et ajustements cosmétiques.",
  "Version finale – intégration des retours de la communauté.",
] as const;

const COMMENT_CONTENTS = [
  "Excellente map ! Les rotations sont vraiment bien pensées.",
  "La zone centrale est trop ouverte, difficile de sortir sans couverture.",
  "Parfaite pour le deathmatch rapide. Je la recommande.",
  "J'aurais aimé plus de chemins alternatifs, mais ça reste sympa.",
  "Les spawns sont un peu déséquilibrés côté nord, à corriger svp.",
  "Top ! Je l'ai ajoutée à mes favoris directement.",
  "Belle map visuellement, mais le gameplay manque de profondeur.",
  "GG au créateur, c'est clairement du travail soigné.",
  "On l'a utilisée en tournoi, ambiance parfaite.",
  "La prise en main est rapide, bon choix pour les débutants.",
  "Quelques bugs de collision au niveau de l'escalier ouest.",
  "Map ambitieuse, les mécaniques de hauteur sont vraiment intéressantes.",
  "Bien mais les corridors sont parfois trop étroits pour 4v4.",
  "Le meilleur deathmatch que j'ai testé sur cette plateforme.",
  "Hâte de voir la v3 !",
] as const;

const SCREENSHOT_SEEDS = [
  "mountain-01",
  "forest-02",
  "city-03",
  "desert-04",
  "ocean-05",
  "night-06",
  "ruins-07",
  "space-08",
  "cave-09",
  "sunset-10",
  "dungeon-11",
  "bridge-12",
  "volcano-13",
  "temple-14",
  "glacier-15",
] as const;

// ── Grille 14×14 déterministe ─────────────────────────────────────────────────

type BlockType = "empty" | "wall" | "floor" | "spawn" | "objective";

type GridBlock = {
  x: number;
  y: number;
  type: Exclude<BlockType, "empty">;
  rotation: number;
};

type GridData = {
  blocks: GridBlock[];
  grid_size: number;
  version: number;
};

const GRID_SIZE = 14;

function generateGrid(seedOffset: number): GridData {
  const random = mulberry32(20251227 + seedOffset);
  const grid: BlockType[][] = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    const row: BlockType[] = [];

    for (let x = 0; x < GRID_SIZE; x += 1) {
      const isBorder = x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1;

      if (isBorder) {
        row.push("wall");
        continue;
      }

      const value = random();

      if (value < 0.22) row.push("wall");
      else if (value < 0.52) row.push("floor");
      else row.push("empty");
    }

    grid.push(row);
  }

  grid[1][1] = "spawn";
  grid[1][GRID_SIZE - 2] = "spawn";
  grid[GRID_SIZE - 2][1] = "spawn";
  grid[GRID_SIZE - 2][GRID_SIZE - 2] = "spawn";

  const mid = Math.floor(GRID_SIZE / 2);
  grid[mid][mid] = "objective";

  const blocks: GridBlock[] = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const type = grid[y][x];

      if (type !== "empty") {
        blocks.push({ x, y, type, rotation: 0 });
      }
    }
  }

  return {
    blocks,
    grid_size: GRID_SIZE,
    version: 1,
  };
}

// ── Helper dates relatives ────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.max(0, n));

  return date;
}

function versionDaysAgo(createdDaysAgo: number, versionNumber: number): number {
  return Math.max(0, createdDaysAgo - (versionNumber - 1) * randInt(2, 15));
}

function getReleaseNotes(versionNumber: number): string {
  if (versionNumber === 1) return pick(RELEASE_NOTES_V1);
  if (versionNumber === 2) return pick(RELEASE_NOTES_V2);

  return pick(RELEASE_NOTES_V3);
}

function getVersionCount(status: MapStatus): number {
  return status === "draft" ? 1 : randInt(1, 3);
}

function getCommentCount(status: MapStatus): number {
  return randInt(status === "draft" ? 0 : 2, status === "stable" ? 8 : 4);
}

function shouldCreateComments(moderationStatus: ModerationStatus): boolean {
  return moderationStatus === "visible";
}

// ── SEED ─────────────────────────────────────────────────────────────────────

export async function seed(knex: Knex): Promise<void> {
  // ── 0. Nettoyage (ordre FK) ───────────────────────────────────────────────
  await knex("map_comment_likes").del();
  await knex("map_comments").del();
  await knex("map_tests").del();
  await knex("map_favorites").del();
  await knex("map_votes").del();
  await knex("map_screenshots").del();
  await knex("map_map_tags").del();
  await knex("map_versions").del();
  await knex("maps").del();
  await knex("map_tags").del();

  // ── 1. Créateurs (upsert pour ne pas casser les utilisateurs existants) ───
  for (const creator of CREATORS) {
    const existingUser: unknown = await knex("users")
      .select("id")
      .where("id", creator.id)
      .first();

    if (existingUser === undefined) {
      await knex("users")
        .insert({
          id: creator.id,
          username: creator.username,
          region: creator.region,
          email: `${creator.username.toLowerCase()}@nebula.dev`,
          created_at: daysAgo(randInt(60, 180)),
          updated_at: daysAgo(randInt(0, 30)),
        })
        .onConflict("id")
        .ignore();
    }
  }

  await knex.raw(`
    SELECT setval(
      pg_get_serial_sequence('users', 'id'),
      GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1),
      true
    )
  `);

  // ── 2. Tags ───────────────────────────────────────────────────────────────
  const tagIdList = await insertReturningIds(knex, "map_tags", TAGS, "map_tags");

  // ── 3. Maps ───────────────────────────────────────────────────────────────
  const totalMaps = MAP_TITLES.length;

  for (let i = 0; i < totalMaps; i += 1) {
    const creator = pick(CREATORS);
    const status = pick(STATUSES);
    const moderationStatus = pick(MOD_STATUSES);
    const isFeatured = i === 0;
    const createdDaysAgo = randInt(3, 120);
    const versionCount = getVersionCount(status);
    const currentVersionNumber = versionCount;
    const title = MAP_TITLES[i] ?? `Map ${i + 1}`;
    const description = MAP_DESCRIPTIONS[i] ?? "Map de démonstration générée automatiquement.";

    // ── Map ────────────────────────────────────────────────────────────────
    const mapId = await insertReturningId(
      knex,
      "maps",
      {
        title,
        description,
        creator_id: creator.id,
        status,
        moderation_status: moderationStatus,
        featured: isFeatured,
        grid_data: generateGrid(i * 7 + 13),
        current_version_number: currentVersionNumber,
        created_at: daysAgo(createdDaysAgo),
        updated_at: daysAgo(randInt(0, createdDaysAgo)),
      },
      `maps:${title}`,
    );

    // ── Versions ───────────────────────────────────────────────────────────
    let currentVersionId: number | null = null;

    for (let versionNumber = 1; versionNumber <= versionCount; versionNumber += 1) {
      const relativeDaysAgo = versionDaysAgo(createdDaysAgo, versionNumber);

      currentVersionId = await insertReturningId(
        knex,
        "map_versions",
        {
          map_id: mapId,
          version_number: versionNumber,
          release_notes: getReleaseNotes(versionNumber),
          created_at: daysAgo(relativeDaysAgo),
          updated_at: daysAgo(relativeDaysAgo),
        },
        `map_versions:map_${mapId}:v${versionNumber}`,
      );
    }

    await knex("maps").where("id", mapId).update({
      current_version_id: currentVersionId,
      last_published_at: versionCount > 1 ? daysAgo(randInt(1, 20)) : null,
    });

    // ── Screenshots (2 à 4 par map) ───────────────────────────────────────
    const screenshotCount = randInt(2, 4);
    const pickedScreenshotSeeds = pickN(SCREENSHOT_SEEDS, screenshotCount);

    await knex("map_screenshots").insert(
      pickedScreenshotSeeds.map((seed, position) => ({
        map_id: mapId,
        url: `https://picsum.photos/seed/gamedash-${mapId}-${seed}/960/540`,
        position,
        created_at: daysAgo(createdDaysAgo),
        updated_at: daysAgo(createdDaysAgo),
      })),
    );

    // ── Tags (1 à 3 par map) ──────────────────────────────────────────────
    const selectedTagIds = pickN(tagIdList, randInt(1, 3));

    if (selectedTagIds.length > 0) {
      await knex("map_map_tags").insert(
        selectedTagIds.map((tagId) => ({
          map_id: mapId,
          tag_id: tagId,
        })),
      );
    }

    // ── Votes ─────────────────────────────────────────────────────────────
    const voteWeight = status === "stable" ? 1 : status === "beta" ? 0.6 : 0.2;
    const voters = pickN(CREATORS, Math.floor(CREATORS.length * voteWeight));

    for (const voter of voters) {
      await knex("map_votes")
        .insert({
          map_id: mapId,
          user_id: voter.id,
          vote: rand() < 0.75 ? "like" : "dislike",
          created_at: daysAgo(randInt(0, createdDaysAgo)),
          updated_at: daysAgo(randInt(0, createdDaysAgo)),
        })
        .onConflict(["map_id", "user_id"])
        .ignore();
    }

    // ── Favoris ───────────────────────────────────────────────────────────
    const favoriteCount = Math.floor(voters.length * 0.5);
    const favoriteUsers = pickN(CREATORS, favoriteCount);

    for (const favoriteUser of favoriteUsers) {
      await knex("map_favorites")
        .insert({
          map_id: mapId,
          user_id: favoriteUser.id,
          created_at: daysAgo(randInt(0, createdDaysAgo)),
        })
        .onConflict(["map_id", "user_id"])
        .ignore();
    }

    // ── Tests ─────────────────────────────────────────────────────────────
    const testCount = randInt(status === "stable" ? 15 : 3, status === "stable" ? 80 : 20);

    for (let testIndex = 0; testIndex < testCount; testIndex += 1) {
      const tester = pick(CREATORS);
      const testDaysAgo = randInt(0, createdDaysAgo);

      await knex("map_tests").insert({
        map_id: mapId,
        user_id: tester.id,
        created_at: daysAgo(testDaysAgo),
      });
    }

    // ── Commentaires (3 à 8 par map visible) ──────────────────────────────
    if (shouldCreateComments(moderationStatus)) {
      const commentCount = getCommentCount(status);

      for (let commentIndex = 0; commentIndex < commentCount; commentIndex += 1) {
        const commenter = pick(CREATORS);
        const commentDaysAgo = randInt(0, createdDaysAgo);
        const content = pick(COMMENT_CONTENTS);

        const commentId = await insertReturningId(
          knex,
          "map_comments",
          {
            map_id: mapId,
            user_id: commenter.id,
            content,
            created_at: daysAgo(commentDaysAgo),
            updated_at: daysAgo(commentDaysAgo),
          },
          `map_comments:map_${mapId}:${commentIndex}`,
        );

        const commentLikers = pickN(CREATORS, randInt(0, 3));

        for (const liker of commentLikers) {
          await knex("map_comment_likes")
            .insert({
              comment_id: commentId,
              user_id: liker.id,
              created_at: daysAgo(randInt(0, commentDaysAgo)),
            })
            .onConflict(["comment_id", "user_id"])
            .ignore();
        }
      }
    }

    console.log(
      `  ✓ Map ${i + 1}/${totalMaps} : "${title}" [${status}] (creator: ${creator.username})`,
    );
  }

  console.log("\n✅ Seed maps terminée avec succès.");
  console.log(`   ${totalMaps} maps, ${TAGS.length} tags, ${CREATORS.length} créateurs`);
}
