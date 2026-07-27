import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { aboutKeys, aboutSectionQuery } from '../about.queries'
import {
  createAboutSection,
  deleteAboutSection,
  updateAboutSection,
  uploadAboutSideImage,
} from '../about.service'
import type { AboutSection } from '../types'

function useInvalidateAboutContent(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: aboutKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useAboutSection() {
  return useQuery(aboutSectionQuery())
}

export function useSaveAboutSection(hasSection: boolean) {
  const invalidateAboutContent = useInvalidateAboutContent()

  return useMutation({
    mutationFn: (input: AboutSection) =>
      hasSection ? updateAboutSection(input) : createAboutSection(input),
    onSuccess: invalidateAboutContent,
  })
}

export function useDeleteAboutSection() {
  const invalidateAboutContent = useInvalidateAboutContent()

  return useMutation({
    mutationFn: deleteAboutSection,
    onSuccess: invalidateAboutContent,
  })
}

export function useUploadAboutSideImage() {
  return useMutation({
    mutationFn: (file: File) => uploadAboutSideImage(file),
  })
}
