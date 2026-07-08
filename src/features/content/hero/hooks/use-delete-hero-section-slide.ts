import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteHeroSectionSlide } from '../hero.service'
import { heroKeys } from '../hero.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'

export function useDeleteHeroSectionSlide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slideIndex: number) => deleteHeroSectionSlide(slideIndex),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}
