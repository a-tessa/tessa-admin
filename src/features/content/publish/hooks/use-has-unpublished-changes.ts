import { useMemo } from 'react'
import { useAdminContent } from './use-admin-content'

/**
 * Coleções que a API sanitiza no publish removendo `id` dos itens
 * (ver tessa-api/src/modules/content/content.utils.ts#sanitizeContentForPublish).
 * Precisamos ignorar esse `id` ao comparar draft vs published para não
 * reportarmos falsamente que há alterações não publicadas.
 */
const ID_STRIPPED_COLLECTIONS = new Set([
  'nps',
  'representantsBase',
  'categories',
  'clients',
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stripIdFromItems(
  items: unknown[],
): Array<Record<string, unknown> | unknown> {
  return items.map((item) => {
    if (!isPlainObject(item)) return item
    const { id: _id, ...rest } = item
    return rest
  })
}

function normalizeForCompare(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForCompare(item))
  }

  if (!isPlainObject(value)) return value

  const result: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined) continue

    if (ID_STRIPPED_COLLECTIONS.has(key) && Array.isArray(raw)) {
      result[key] = stripIdFromItems(raw).map((item) => normalizeForCompare(item))
      continue
    }

    result[key] = normalizeForCompare(raw)
  }

  return result
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    return a.every((item, i) => deepEqual(item, b[i]))
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>

    const aKeys = Object.keys(aObj).filter((k) => aObj[k] !== undefined)
    const bKeys = Object.keys(bObj).filter((k) => bObj[k] !== undefined)

    if (aKeys.length !== bKeys.length) return false
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
  }

  return false
}

interface UnpublishedChangesResult {
  hasChanges: boolean
  isLoading: boolean
  publishedAt: string | null
  updatedAt: string | null
  status: 'draft' | 'published' | null
}

export function useHasUnpublishedChanges(): UnpublishedChangesResult {
  const { data, isPending } = useAdminContent()

  const hasChanges = useMemo(() => {
    if (!data) return false
    if (!data.publishedContent) return true

    const normalizedDraft = normalizeForCompare(data.content)
    const normalizedPublished = normalizeForCompare(data.publishedContent)

    return !deepEqual(normalizedDraft, normalizedPublished)
  }, [data])

  return {
    hasChanges,
    isLoading: isPending,
    publishedAt: data?.publishedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
    status: data?.status ?? null,
  }
}
