import { describe, expect, it } from 'vitest'

import { buildMapsExportRows, toCsv, toCsvValue } from '@/services/export'
import type { MapItem } from '@/types/maps'

const sampleMap: MapItem = {
  id: 'map-1',
  title: 'Arena "Prime"',
  description: 'Fast lane',
  creator: {
    id: 'creator-1',
    username: 'Nova',
    region: 'EU',
    avatarSeed: 'nova',
    maps_count: 3,
    total_tests: 1200,
    total_likes: 530,
  },
  tags: [
    { id: 't1', slug: 'fps', label_fr: 'FPS', label_en: 'FPS' },
    { id: 't2', slug: 'ctf', label_fr: 'CTF', label_en: 'CTF' },
  ],
  screenshots: [{ id: 'ss1', url: 'https://example.com/1.png', position: 0 }],
  status: 'stable',
  visibility: 'visible',
  featured: true,
  current_version_number: 4,
  versions_count: 4,
  versions: [
    {
      id: 'v1',
      version_number: 1,
      release_notes: 'init',
      parent_version_id: null,
      created_at: '2026-05-10T00:00:00.000Z',
      snapshot_url: null,
    },
  ],
  created_at: '2026-05-10T00:00:00.000Z',
  updated_at: '2026-05-18T00:00:00.000Z',
  stats: {
    tests_count: 250,
    likes_count: 100,
    dislikes_count: 10,
    favorites_count: 44,
    score: 760,
    retention: 0.41,
    last_activity_at: '2026-05-18T01:00:00.000Z',
  },
  user_vote: null,
  is_favorite: false,
}

describe('export service', () => {
  it('escapes values for CSV safely', () => {
    expect(toCsvValue('hello')).toBe('"hello"')
    expect(toCsvValue('A "quote" here')).toBe('"A ""quote"" here"')
    expect(toCsvValue(null)).toBe('""')
  })

  it('serializes rows to CSV with headers', () => {
    const csv = toCsv([
      { id: 1, title: 'One' },
      { id: 2, title: 'Two' },
    ])

    expect(csv).toContain('"id","title"')
    expect(csv).toContain('"1","One"')
    expect(csv).toContain('"2","Two"')
  })

  it('builds flattened map export rows', () => {
    const rows = buildMapsExportRows([sampleMap])

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      id: 'map-1',
      creator_username: 'Nova',
      tags: 'fps|ctf',
      tests_count: 250,
      score: 760,
    })
  })
})
