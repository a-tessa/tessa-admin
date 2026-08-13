import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { resultsKeys, resultsSectionQuery } from '../results.queries'
import {
  createResultsSection,
  deleteResultsSection,
  updateResultsSection,
} from '../results.service'
import type { ResultsSection } from '../types'

function useInvalidateResultsContent(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: resultsKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useResultsSection() {
  return useQuery(resultsSectionQuery())
}

export function useSaveResultsSection(hasSection: boolean) {
  const invalidateResultsContent = useInvalidateResultsContent()

  return useMutation({
    mutationFn: (input: ResultsSection) =>
      hasSection
        ? updateResultsSection(input)
        : createResultsSection(input),
    onSuccess: invalidateResultsContent,
  })
}

export function useDeleteResultsSection() {
  const invalidateResultsContent = useInvalidateResultsContent()

  return useMutation({
    mutationFn: deleteResultsSection,
    onSuccess: invalidateResultsContent,
  })
}
