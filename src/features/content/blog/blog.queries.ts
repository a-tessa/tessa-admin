import { queryOptions } from '@tanstack/react-query'
import {
  fetchAdminBlogArticles,
  fetchBlogArticleBySlug,
} from './blog.service'
import type { AdminBlogListParams } from './types'

export const blogKeys = {
  all: ['content', 'blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: AdminBlogListParams) =>
    [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
}

export function adminBlogArticlesQuery(params: AdminBlogListParams = {}) {
  return queryOptions({
    queryKey: blogKeys.list(params),
    queryFn: () => fetchAdminBlogArticles(params),
  })
}

export function blogArticleDetailQuery(slug: string) {
  return queryOptions({
    queryKey: blogKeys.detail(slug),
    queryFn: () => fetchBlogArticleBySlug(slug),
    enabled: slug !== '',
  })
}
