import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { industryKeys, industrySectionQuery } from '../industry.queries'
import {
  createIndustrySection,
  deleteIndustrySection,
  updateIndustrySection,
} from '../industry.service'
import type { IndustrySection } from '../types'

function useInvalidateIndustryContent(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: industryKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useIndustrySection() {
  return useQuery(industrySectionQuery())
}

export function useSaveIndustrySection(hasSection: boolean) {
  const invalidateIndustryContent = useInvalidateIndustryContent()

  return useMutation({
    mutationFn: (input: IndustrySection) =>
      hasSection
        ? updateIndustrySection(input)
        : createIndustrySection(input),
    onSuccess: invalidateIndustryContent,
  })
}

export function useDeleteIndustrySection() {
  const invalidateIndustryContent = useInvalidateIndustryContent()

  return useMutation({
    mutationFn: deleteIndustrySection,
    onSuccess: invalidateIndustryContent,
  })
}
