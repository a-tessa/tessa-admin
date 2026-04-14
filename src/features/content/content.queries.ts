import { queryOptions } from '@tanstack/react-query'
import { fetchContentPage, fetchContentPages } from './services/content.service'
import type { ContentPaginationParams } from './types'

export const contentKeys = {
  all: ['content-pages'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  list: (params: ContentPaginationParams) => [...contentKeys.lists(), params] as const,
  details: () => [...contentKeys.all, 'detail'] as const,
  detail: (slug: string) => [...contentKeys.details(), slug] as const,
}

export function contentPagesQuery(params: ContentPaginationParams) {
  return queryOptions({
    queryKey: contentKeys.list(params),
    queryFn: () => fetchContentPages(params),
  })
}

export function contentPageQuery(slug: string) {
  return queryOptions({
    queryKey: contentKeys.detail(slug),
    queryFn: () => fetchContentPage(slug),
    enabled: slug !== '',
  })
}
