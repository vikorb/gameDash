import type { MapItem } from '@/types/maps'

export type CsvRow = Record<string, unknown>

export function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '""'

  if (value instanceof Date) {
    return `"${value.toISOString()}"`
  }

  const raw = typeof value === 'string' ? value : JSON.stringify(value)
  const escaped = raw.replace(/"/g, '""')
  return `"${escaped}"`
}

export function toCsv(rows: CsvRow[]): string {
  if (!rows.length) return ''

  const headers = Object.keys(rows[0] ?? {})
  const csvHeaders = headers.map((header) => toCsvValue(header)).join(',')
  const csvRows = rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(','))

  return [csvHeaders, ...csvRows].join('\n')
}

export function buildMapsExportRows(maps: MapItem[]): CsvRow[] {
  return maps.map((map) => ({
    id: map.id,
    title: map.title,
    description: map.description,
    creator_id: map.creator.id,
    creator_username: map.creator.username,
    status: map.status,
    featured: map.featured,
    current_version_number: map.current_version_number,
    versions_count: map.versions_count,
    tags: map.tags.map((tag) => tag.slug).join('|'),
    tests_count: map.stats.tests_count,
    likes_count: map.stats.likes_count,
    dislikes_count: map.stats.dislikes_count,
    favorites_count: map.stats.favorites_count,
    score: map.stats.score,
    retention: map.stats.retention,
    created_at: map.created_at,
    updated_at: map.updated_at,
  }))
}
