import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { MapCreator, MapItem, MapSortKey, MapStatus, MapTag, MapVote } from '@/types/maps'

/* -------------------------------------------------------------------------- */
/*                              Mock data sources                             */
/* -------------------------------------------------------------------------- */

const CREATOR_NAMES = [
  'NovaArchitect',
  'VoidSculptor',
  'PixelWeaver',
  'NeonForge',
  'CrimsonByte',
  'ZephyrCoder',
  'LunaMapsmith',
  'ShadowPainter',
  'ChromaBuilder',
  'ArcaneRig',
  'StormCarver',
  'VertexVagrant',
  'NebulaCraft',
  'HelixHaven',
  'PulseDrafter',
]

const TAG_LIBRARY: MapTag[] = [
  { id: 't-fps', slug: 'fps', label_fr: 'FPS', label_en: 'FPS' },
  { id: 't-tdm', slug: 'tdm', label_fr: 'Combat équipe', label_en: 'Team Deathmatch' },
  { id: 't-br', slug: 'br', label_fr: 'Battle Royale', label_en: 'Battle Royale' },
  { id: 't-race', slug: 'race', label_fr: 'Course', label_en: 'Racing' },
  { id: 't-parkour', slug: 'parkour', label_fr: 'Parkour', label_en: 'Parkour' },
  { id: 't-puzzle', slug: 'puzzle', label_fr: 'Énigme', label_en: 'Puzzle' },
  { id: 't-survival', slug: 'survival', label_fr: 'Survie', label_en: 'Survival' },
  { id: 't-sniper', slug: 'sniper', label_fr: 'Sniper', label_en: 'Sniper' },
  { id: 't-ctf', slug: 'ctf', label_fr: 'Capture du drapeau', label_en: 'Capture the Flag' },
  { id: 't-zombie', slug: 'zombie', label_fr: 'Zombie', label_en: 'Zombie' },
  { id: 't-trial', slug: 'trial', label_fr: 'Trial', label_en: 'Trial' },
  { id: 't-speed', slug: 'speedrun', label_fr: 'Speedrun', label_en: 'Speedrun' },
  { id: 't-arcade', slug: 'arcade', label_fr: 'Arcade', label_en: 'Arcade' },
  { id: 't-hardcore', slug: 'hardcore', label_fr: 'Hardcore', label_en: 'Hardcore' },
  { id: 't-scifi', slug: 'scifi', label_fr: 'Sci-Fi', label_en: 'Sci-Fi' },
  { id: 't-fantasy', slug: 'fantasy', label_fr: 'Fantasy', label_en: 'Fantasy' },
  { id: 't-urban', slug: 'urban', label_fr: 'Urbain', label_en: 'Urban' },
  { id: 't-desert', slug: 'desert', label_fr: 'Désert', label_en: 'Desert' },
  { id: 't-snow', slug: 'snow', label_fr: 'Neige', label_en: 'Snow' },
  { id: 't-jungle', slug: 'jungle', label_fr: 'Jungle', label_en: 'Jungle' },
  { id: 't-indus', slug: 'industrial', label_fr: 'Industriel', label_en: 'Industrial' },
  { id: 't-aerial', slug: 'aerial', label_fr: 'Aérien', label_en: 'Aerial' },
  { id: 't-night', slug: 'night', label_fr: 'Nocturne', label_en: 'Nocturnal' },
  { id: 't-bunker', slug: 'bunker', label_fr: 'Bunker', label_en: 'Bunker' },
]

const TITLES = [
  'Neon Spires',
  'Crimson Mesa',
  'Zero Gravity Arena',
  'Ironback Foundry',
  'Whispering Canyon',
  'Synthwave Speedway',
  'Velvet Vault',
  'Eclipse Citadel',
  'Glacier Run',
  'Solar Drift',
  'Phantom Loop',
  'Static Riot',
  'Bunker 47',
  'Aurora Heights',
  'Twilight Verge',
  'Helios Quarry',
  'Obsidian Hangar',
  'Sapphire Subway',
  'Mirage Outpost',
  'Plasma Pit',
  'Driftwood Bazaar',
  'Quartz Crucible',
  'Echo Chamber',
  'Cobalt Crossing',
  'Mercury Maze',
  'Tundra Tactica',
  'Saffron Skies',
  'Vortex Vault',
  'Magnesium Mile',
  'Stratosphere Station',
  'Lighthouse Loop',
  'Atlas Arcade',
  'Onyx Overpass',
  'Quantum Quay',
  'Riftline Reactor',
  'Cinder Citadel',
  'Halcyon Heights',
  'Nebula Necropolis',
  'Tempest Terraces',
  'Shoreline Shrine',
]

const DESCRIPTIONS = [
  'Compact arena tuned for close combat, with winding corridors and stacked levels.',
  'Open vertical map built for snipers, with long sightlines and ample cover.',
  'Urban racing inspired layout chaining jumps, drifts and hidden shortcuts.',
  'Technical parkour map for demanding speedrunners — tight timings and precise lines.',
  'A slow ascent through an abandoned complex packed with traps and puzzles.',
  'Symmetrical 3v3 arena tuned for competitive balance and fast rotations.',
  'Snow-covered terrain with long-range sightlines and several strategic points.',
  'Scripted level — clear waves of enemies inside an underground bunker.',
  'Futuristic racing track with reduced gravity, perfect for spectacular runs.',
  'Cooperative map focused on team challenges and environmental puzzles.',
]

const MY_USER_ID = 66
const MY_CREATOR_ID = String(MY_USER_ID)

const MY_CREATOR: MapCreator = {
  id: MY_CREATOR_ID,
  username: 'Moi',
  region: 'EU',
  avatarSeed: `user-${MY_USER_ID}`,
  maps_count: 5,
  total_tests: 8420,
  total_likes: 4210,
}

const MY_MAP_IDS = new Set<string>(['map-0', 'map-3', 'map-7', 'map-14', 'map-22'])
const PRETESTED_IDS = ['map-0', 'map-1', 'map-2', 'map-4', 'map-5', 'map-7', 'map-11']
const MY_MAP_CONFIGS = [
  {
    id: 'my-map-1',
    title: 'Lootopia Training Grounds',
    description: 'Map personnelle pensée pour tester les mécaniques principales de GameDash.',
    status: 'stable' as MapStatus,
    tagSlugs: ['fps', 'parkour', 'urban'],
    featured: true,
  },
  {
    id: 'my-map-2',
    title: 'Shadow Sprint Arena',
    description:
      'Arène rapide avec rotations courtes, idéale pour les duels et les tests de scoring.',
    status: 'beta' as MapStatus,
    tagSlugs: ['race', 'speedrun', 'night'],
    featured: false,
  },
  {
    id: 'my-map-3',
    title: 'Bunker Dev Zone',
    description:
      'Zone de test fermée pour équilibrer les pièges, les vagues ennemies et les objectifs.',
    status: 'draft' as MapStatus,
    tagSlugs: ['bunker', 'zombie', 'hardcore'],
    featured: false,
  },
  {
    id: 'my-map-4',
    title: 'Neon Capture District',
    description:
      'Carte compétitive orientée capture du drapeau avec plusieurs routes alternatives.',
    status: 'stable' as MapStatus,
    tagSlugs: ['ctf', 'scifi', 'urban'],
    featured: true,
  },
  {
    id: 'my-map-5',
    title: 'Crystal Puzzle Run',
    description:
      'Parcours personnel basé sur des énigmes, des timings précis et des raccourcis cachés.',
    status: 'beta' as MapStatus,
    tagSlugs: ['puzzle', 'parkour', 'fantasy'],
    featured: false,
  },
]

/* -------------------------------------------------------------------------- */
/*                               Seeded RNG                                   */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20251227)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length)
    out.push(copy.splice(idx, 1)[0]!)
  }
  return out
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.max(0, days))
  return d.toISOString()
}

const WEIGHTED_STATUSES: MapStatus[] = ['draft', 'beta', 'stable', 'stable', 'stable', 'beta']

/* -------------------------------------------------------------------------- */
/*                               Generators                                   */
/* -------------------------------------------------------------------------- */

function generateCreator(idx: number): MapCreator {
  const name = CREATOR_NAMES[idx % CREATOR_NAMES.length] ?? 'Anonymous'
  return {
    id: `creator-${idx}`,
    username: name,
    region: pick(['EU', 'NA', 'APAC', 'SA']),
    avatarSeed: name.toLowerCase(),
    maps_count: 1 + Math.floor(rand() * 12),
    total_tests: 100 + Math.floor(rand() * 9000),
    total_likes: 50 + Math.floor(rand() * 5000),
  }
}

function generateMap(idx: number, creators: MapCreator[]): MapItem {
  const title = TITLES[idx % TITLES.length] ?? 'Untitled Map'
  const creator = creators[Math.floor(rand() * creators.length)] ?? generateCreator(0)
  const status = pick(WEIGHTED_STATUSES)
  const tags = pickN(TAG_LIBRARY, 2 + Math.floor(rand() * 3))

  const tests =
    status === 'stable'
      ? 200 + Math.floor(rand() * 4800)
      : status === 'beta'
        ? 30 + Math.floor(rand() * 400)
        : Math.floor(rand() * 20)

  const likes = Math.floor(tests * (0.25 + rand() * 0.4))
  const dislikes = Math.floor(tests * (0.02 + rand() * 0.12))
  const favorites = Math.floor(tests * (0.05 + rand() * 0.15))
  const versions = 1 + Math.floor(rand() * 8)
  const createdDays = 30 + Math.floor(rand() * 400)
  const updatedDays = Math.floor(rand() * createdDays * 0.6)

  const recencyFactor = Math.max(0, 1 - updatedDays / 60)
  const score = Math.round(
    (likes * 1.5 - dislikes * 1.2 + Math.sqrt(tests) * 4 + favorites * 2.2) *
      (0.7 + recencyFactor * 0.6),
  )

  const retention = Math.min(0.95, Math.max(0.04, favorites / Math.max(tests, 1) + rand() * 0.15))

  const screenshots = Array.from({ length: 1 + Math.floor(rand() * 4) }).map((_, i) => ({
    id: `ss-${idx}-${i}`,
    url: `https://picsum.photos/seed/gamedash-map-${idx}-${i}/960/540`,
    position: i,
  }))

  const versionList = Array.from({ length: versions }).map((_, i) => ({
    id: `version-${idx}-${i + 1}`,
    version_number: i + 1,
    release_notes:
      i === 0
        ? 'Publication initiale.'
        : `Équilibrage, ajustements visuels et correctifs (v${i + 1}).`,
    parent_version_id: i === 0 ? null : `version-${idx}-${i}`,
    created_at: daysAgo(
      createdDays - Math.floor((createdDays - updatedDays) * (i / Math.max(versions - 1, 1))),
    ),
    snapshot_url: null,
  }))

  return {
    id: `map-${idx}`,
    title,
    description: DESCRIPTIONS[idx % DESCRIPTIONS.length] ?? 'Aucune description disponible.',
    creator,
    tags,
    screenshots,
    status,
    visibility: 'visible',
    featured: rand() > 0.85,
    current_version_number: versions,
    versions_count: versions,
    versions: versionList,
    created_at: daysAgo(createdDays),
    updated_at: daysAgo(updatedDays),
    stats: {
      tests_count: tests,
      likes_count: likes,
      dislikes_count: dislikes,
      favorites_count: favorites,
      score,
      retention,
      last_activity_at: daysAgo(Math.max(0, updatedDays - Math.floor(rand() * 5))),
    },
    user_vote: null,
    is_favorite: false,
  }
}

function getTagsBySlugs(slugs: string[]): MapTag[] {
  return TAG_LIBRARY.filter((tag) => slugs.includes(tag.slug))
}

function generateMyMap(idx: number, config: (typeof MY_MAP_CONFIGS)[number]): MapItem {
  const base = generateMap(1000 + idx, [MY_CREATOR])

  return {
    ...base,
    id: config.id,
    title: config.title,
    description: config.description,
    creator: MY_CREATOR,
    tags: getTagsBySlugs(config.tagSlugs),
    status: config.status,
    visibility: 'visible',
    featured: config.featured,
    user_vote: null,
    is_favorite: false,
    screenshots: base.screenshots.map((screenshot, screenshotIdx) => ({
      ...screenshot,
      id: `my-map-${idx + 1}-ss-${screenshotIdx}`,
      url: `https://picsum.photos/seed/gamedash-my-map-${idx + 1}-${screenshotIdx}/960/540`,
    })),
    versions: base.versions.map((version, versionIdx) => ({
      ...version,
      id: `my-map-${idx + 1}-version-${versionIdx + 1}`,
      parent_version_id: versionIdx === 0 ? null : `my-map-${idx + 1}-version-${versionIdx}`,
    })),
  }
}

function generateMockData() {
  const generatedCreators = Array.from({ length: 15 }).map((_, i) => generateCreator(i))
  const creators = [MY_CREATOR, ...generatedCreators]

  const generatedMaps = Array.from({ length: 40 }).map((_, i) => generateMap(i, generatedCreators))
  const myMaps = MY_MAP_CONFIGS.map((config, i) => generateMyMap(i, config))

  return {
    creators,
    maps: [...myMaps, ...generatedMaps],
  }
}

function seedUserActivity(maps: MapItem[]) {
  const liked = [0, 2, 4, 7, 11, 16]
  const disliked = [5, 13]
  const favorited = [2, 4, 7]
  liked.forEach((i) => {
    if (maps[i]) maps[i]!.user_vote = 'like'
  })
  disliked.forEach((i) => {
    if (maps[i]) maps[i]!.user_vote = 'dislike'
  })
  favorited.forEach((i) => {
    if (maps[i]) maps[i]!.is_favorite = true
  })
}

/* -------------------------------------------------------------------------- */
/*                                   Store                                    */
/* -------------------------------------------------------------------------- */

export const useMapsStore = defineStore('maps', () => {
  const initial = generateMockData()
  seedUserActivity(initial.maps)
  const maps = ref<MapItem[]>(initial.maps)
  const testedMapIds = ref<string[]>([...PRETESTED_IDS])
  const creators = ref<MapCreator[]>(initial.creators)
  const tagLibrary = ref<MapTag[]>(TAG_LIBRARY)

  const search = ref('')
  const selectedTag = ref<string>('')
  const selectedStatus = ref<MapStatus | ''>('')
  const sortKey = ref<MapSortKey>('popular')

  const visibleMaps = computed(() => maps.value.filter((m) => m.visibility === 'visible'))

  const filteredMaps = computed(() => {
    let list = visibleMaps.value

    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.creator.username.toLowerCase().includes(q) ||
          m.tags.some((t) => t.slug.toLowerCase().includes(q)),
      )
    }

    if (selectedTag.value) {
      list = list.filter((m) => m.tags.some((t) => t.slug === selectedTag.value))
    }

    if (selectedStatus.value) {
      list = list.filter((m) => m.status === selectedStatus.value)
    }

    const sorted = [...list]

    if (sortKey.value === 'popular') {
      sorted.sort((a, b) => b.stats.score - a.stats.score)
    } else if (sortKey.value === 'recent') {
      sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    } else if (sortKey.value === 'top') {
      sorted.sort((a, b) => {
        const totalA = a.stats.likes_count + a.stats.dislikes_count
        const totalB = b.stats.likes_count + b.stats.dislikes_count
        const ratioA = totalA > 0 ? a.stats.likes_count / totalA : 0
        const ratioB = totalB > 0 ? b.stats.likes_count / totalB : 0
        return ratioB - ratioA
      })
    } else if (sortKey.value === 'mostTested') {
      sorted.sort((a, b) => b.stats.tests_count - a.stats.tests_count)
    }

    return sorted
  })

  const totalMaps = computed(() => visibleMaps.value.length)
  const totalCreators = computed(() => creators.value.length)
  const totalTestsLast24h = computed(() =>
    maps.value.reduce((sum, m) => sum + Math.floor(m.stats.tests_count * 0.02), 0),
  )
  const topScore = computed(() => maps.value.reduce((max, m) => Math.max(max, m.stats.score), 0))
  const featuredMap = computed(
    () => [...visibleMaps.value].sort((a, b) => b.stats.score - a.stats.score)[0] ?? null,
  )

  const topCreators = computed(() =>
    [...creators.value]
      .map((c) => ({
        ...c,
        maps: maps.value.filter((m) => m.creator.id === c.id),
      }))
      .sort((a, b) => b.total_likes - a.total_likes)
      .slice(0, 4),
  )

  function getMap(id: string): MapItem | undefined {
    return maps.value.find((m) => m.id === id)
  }

  function toggleVote(mapId: string, vote: Exclude<MapVote, null>) {
    const map = maps.value.find((m) => m.id === mapId)
    if (!map) return
    const prev = map.user_vote

    if (prev === vote) {
      map.user_vote = null
      if (vote === 'like') map.stats.likes_count = Math.max(0, map.stats.likes_count - 1)
      else map.stats.dislikes_count = Math.max(0, map.stats.dislikes_count - 1)
      return
    }

    if (prev === 'like') map.stats.likes_count = Math.max(0, map.stats.likes_count - 1)
    if (prev === 'dislike') map.stats.dislikes_count = Math.max(0, map.stats.dislikes_count - 1)
    map.user_vote = vote
    if (vote === 'like') map.stats.likes_count += 1
    else map.stats.dislikes_count += 1
  }

  function toggleFavorite(mapId: string) {
    const map = maps.value.find((m) => m.id === mapId)
    if (!map) return
    map.is_favorite = !map.is_favorite
    if (map.is_favorite) map.stats.favorites_count += 1
    else map.stats.favorites_count = Math.max(0, map.stats.favorites_count - 1)
  }

  function recordTest(mapId: string) {
    const map = maps.value.find((m) => m.id === mapId)
    if (!map) return
    map.stats.tests_count += 1
    map.stats.last_activity_at = new Date().toISOString()
    if (!testedMapIds.value.includes(mapId)) {
      testedMapIds.value.push(mapId)
    }
  }

  const myMaps = computed(() => maps.value.filter((m) => MY_MAP_IDS.has(m.id)))

  const myTotalTests = computed(() => myMaps.value.reduce((sum, m) => sum + m.stats.tests_count, 0))
  const myTotalLikes = computed(() => myMaps.value.reduce((sum, m) => sum + m.stats.likes_count, 0))
  const myAvgScore = computed(() => {
    if (!myMaps.value.length) return 0
    return Math.round(myMaps.value.reduce((sum, m) => sum + m.stats.score, 0) / myMaps.value.length)
  })
  const myTopScore = computed(() =>
    myMaps.value.reduce((max, m) => Math.max(max, m.stats.score), 0),
  )

  const likedMaps = computed(() => maps.value.filter((m) => m.user_vote === 'like'))
  const dislikedMaps = computed(() => maps.value.filter((m) => m.user_vote === 'dislike'))
  const favoriteMaps = computed(() => maps.value.filter((m) => m.is_favorite))
  const testedMaps = computed(() => maps.value.filter((m) => testedMapIds.value.includes(m.id)))

  function isMyMap(id: string) {
    return MY_MAP_IDS.has(id)
  }

  function createMap(data: {
    title: string
    description: string
    status: MapStatus
    tags: MapTag[]
  }): string {
    const id = `map-u${Date.now()}`
    const creator = creators.value[0]!
    const newMap: MapItem = {
      id,
      title: data.title,
      description: data.description,
      creator,
      tags: data.tags,
      screenshots: [
        {
          id: `ss-new-0`,
          url: `https://picsum.photos/seed/${id}/960/540`,
          position: 0,
        },
      ],
      status: data.status,
      visibility: 'visible',
      featured: false,
      current_version_number: 1,
      versions_count: 1,
      versions: [
        {
          id: `${id}-v1`,
          version_number: 1,
          release_notes: 'Publication initiale.',
          parent_version_id: null,
          created_at: new Date().toISOString(),
          snapshot_url: null,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        tests_count: 0,
        likes_count: 0,
        dislikes_count: 0,
        favorites_count: 0,
        score: 0,
        retention: 0,
        last_activity_at: new Date().toISOString(),
      },
      user_vote: null,
      is_favorite: false,
    }
    maps.value.unshift(newMap)
    MY_MAP_IDS.add(id)
    return id
  }

  function updateMap(
    mapId: string,
    data: {
      title?: string
      description?: string
      status?: MapStatus
      tags?: MapTag[]
      releaseNotes?: string
    },
  ): void {
    const map = maps.value.find((m) => m.id === mapId)
    if (!map) return
    if (data.title !== undefined) map.title = data.title
    if (data.description !== undefined) map.description = data.description
    if (data.status !== undefined) map.status = data.status
    if (data.tags !== undefined) map.tags = data.tags
    if (data.releaseNotes?.trim()) {
      const v = map.versions_count + 1
      map.versions.push({
        id: `${mapId}-v${v}`,
        version_number: v,
        release_notes: data.releaseNotes.trim(),
        parent_version_id: `${mapId}-v${map.versions_count}`,
        created_at: new Date().toISOString(),
        snapshot_url: null,
      })
      map.versions_count = v
      map.current_version_number = v
    }
    map.updated_at = new Date().toISOString()
  }

  return {
    // state
    maps,
    creators,
    tagLibrary,
    search,
    selectedTag,
    selectedStatus,
    sortKey,
    // getters
    visibleMaps,
    filteredMaps,
    totalMaps,
    totalCreators,
    totalTestsLast24h,
    topScore,
    featuredMap,
    topCreators,
    isMyMap,
    // actions
    getMap,
    toggleVote,
    toggleFavorite,
    recordTest,
    myMaps,
    myTotalTests,
    myTotalLikes,
    myAvgScore,
    myTopScore,
    createMap,
    updateMap,
    testedMapIds,
    likedMaps,
    dislikedMaps,
    favoriteMaps,
    testedMaps,
  }
})
