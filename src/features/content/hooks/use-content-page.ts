import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { fetchContentPage } from '../services/content.service'

export function useContentPage(slug: string | undefined) {
  const { session } = useAuth()
  const accessToken = session?.accessToken ?? ''

  return useQuery({
    queryKey: ['content-page', slug],
    queryFn: () => fetchContentPage(slug ?? '', accessToken),
    enabled: session !== null && slug !== undefined && slug !== '',
  })
}
