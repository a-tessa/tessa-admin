import { useQuery } from '@tanstack/react-query'
import { adminBlogArticlesQuery } from '../blog.queries'
import type { AdminBlogListParams } from '../types'

export function useAdminBlogArticles(params: AdminBlogListParams = {}) {
  return useQuery(adminBlogArticlesQuery(params))
}
