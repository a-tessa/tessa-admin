import { useMutation, useQueryClient } from '@tanstack/react-query'
import { publishMainContent } from '../publish.service'
import { adminContentKeys } from '../publish.queries'
import { contentKeys } from '../../content.queries'
import { heroKeys } from '../../hero/hero.queries'

export function usePublishMainContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishMainContent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: heroKeys.all })
    },
  })
}
