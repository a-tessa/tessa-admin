import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createHeroSection } from '../hero.service'
import { heroKeys } from '../hero.queries'
import { contentKeys } from '../../content.queries'
import type { HeroSectionFormData } from '../types'

export function useCreateHeroSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HeroSectionFormData) => createHeroSection(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}
