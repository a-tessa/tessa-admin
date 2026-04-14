import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteHeroSection } from '../hero.service'
import { heroKeys } from '../hero.queries'
import { contentKeys } from '../../content.queries'

export function useDeleteHeroSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteHeroSection(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}
