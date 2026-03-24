import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { fetchContentPages } from '../services/content.service'

export function useContentPages(page: number, perPage: number) {
  const { session } = useAuth()
  const accessToken = session?.accessToken ?? ''

  return useQuery({
    queryKey: ['content-pages', { page, perPage }],
    queryFn: () => fetchContentPages({ page, perPage }, accessToken),
    enabled: session !== null,
  })
}
