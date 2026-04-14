import { useMemo } from 'react'
import { useAdminContent } from './use-admin-content'

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
    return !deepEqual(data.content, data.publishedContent)
  }, [data])

  return {
    hasChanges,
    isLoading: isPending,
    publishedAt: data?.publishedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
    status: data?.status ?? null,
  }
}
