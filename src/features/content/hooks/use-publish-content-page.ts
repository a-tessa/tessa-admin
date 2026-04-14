import { useMutation, useQueryClient } from '@tanstack/react-query'
import { publishContentPage } from '../services/content.service'
import { contentKeys } from '../content.queries'

export function usePublishContentPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => publishContentPage(slug),
    onSuccess: (_data, slug) => {
      void queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: contentKeys.detail(slug),
      })
    },
  })
}
