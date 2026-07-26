import { useMutation, useQueryClient } from '@tanstack/react-query'
import { retryHomepageTranslations } from '../publish.service'
import { publicationStatusKeys } from '../publish.queries'

export function useRetryHomepageTranslations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: retryHomepageTranslations,
    onSuccess: (status) => {
      queryClient.setQueryData(publicationStatusKeys.detail(), status)
      void queryClient.invalidateQueries({ queryKey: publicationStatusKeys.all })
    },
  })
}
