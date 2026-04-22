import { useQuery } from '@tanstack/react-query'
import { blogArticleDetailQuery } from '../blog.queries'

export function useBlogArticle(slug: string) {
  return useQuery(blogArticleDetailQuery(slug))
}
