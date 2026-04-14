import { useQuery } from '@tanstack/react-query'
import { contentPagesQuery } from '../content.queries'

export function useContentPages(page: number, perPage: number) {
  return useQuery(contentPagesQuery({ page, perPage }))
}
