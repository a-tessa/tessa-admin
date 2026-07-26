import { useMemo } from 'react'
import { useAdminContent } from './use-admin-content'
import {
  isDeepEqual,
  normalizeContentForComparison,
} from '../publication-summary'

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

    const normalizedDraft = normalizeContentForComparison(data.content)
    const normalizedPublished = normalizeContentForComparison(
      data.publishedContent,
    )

    return !isDeepEqual(normalizedDraft, normalizedPublished)
  }, [data])

  return {
    hasChanges,
    isLoading: isPending,
    publishedAt: data?.publishedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
    status: data?.status ?? null,
  }
}
