import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { publishContentPage } from '../services/content.service'

export function usePublishContentPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken ?? ''

  return useMutation({
    mutationFn: (slug: string) => publishContentPage(slug, accessToken),
    onSuccess: (_data, slug) => {
      void queryClient.invalidateQueries({ queryKey: ['content-pages'] })
      void queryClient.invalidateQueries({
        queryKey: ['content-page', slug],
      })
    },
  })
}
