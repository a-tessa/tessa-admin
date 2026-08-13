import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { footerKeys, footerSectionQuery } from '../footer.queries'
import {
  createFooterSection,
  deleteFooterSection,
  updateFooterSection,
} from '../footer.service'
import type { FooterSection } from '../types'

function useInvalidateFooterContent(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: footerKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useFooterSection() {
  return useQuery(footerSectionQuery())
}

export function useSaveFooterSection(hasSection: boolean) {
  const invalidateFooterContent = useInvalidateFooterContent()

  return useMutation({
    mutationFn: (input: FooterSection) =>
      hasSection ? updateFooterSection(input) : createFooterSection(input),
    onSuccess: invalidateFooterContent,
  })
}

export function useDeleteFooterSection() {
  const invalidateFooterContent = useInvalidateFooterContent()

  return useMutation({
    mutationFn: deleteFooterSection,
    onSuccess: invalidateFooterContent,
  })
}
