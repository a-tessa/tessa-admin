import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateHeroSection } from '../hero.service'
import { heroKeys } from '../hero.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { HeroSectionFormData } from '../types'

export function useUpdateHeroSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HeroSectionFormData) => updateHeroSection(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}
