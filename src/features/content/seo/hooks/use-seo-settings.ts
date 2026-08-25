import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { pageSeoQuery, seoDefaultsQuery, seoKeys } from '../seo.queries'
import {
  createPageSeo,
  createSeoDefaults,
  deletePageSeoOgImage,
  deleteSeoDefaultOgImage,
  updatePageSeo,
  updateSeoDefaults,
  uploadPageSeoOgImage,
  uploadSeoDefaultOgImage,
} from '../seo.service'
import type { PageSeo, SeoDefaults, SeoPageKey } from '../types'

function useInvalidateSeo(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: seoKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useSeoDefaults() {
  return useQuery(seoDefaultsQuery())
}

export function usePageSeo() {
  return useQuery(pageSeoQuery())
}

export function useSaveSeoDefaults(hasSection: boolean) {
  const invalidateSeo = useInvalidateSeo()

  return useMutation({
    mutationFn: (input: SeoDefaults) =>
      hasSection ? updateSeoDefaults(input) : createSeoDefaults(input),
    onSuccess: invalidateSeo,
  })
}

export function useSavePageSeo(hasSection: boolean) {
  const invalidateSeo = useInvalidateSeo()

  return useMutation({
    mutationFn: (input: PageSeo) =>
      hasSection ? updatePageSeo(input) : createPageSeo(input),
    onSuccess: invalidateSeo,
  })
}

export function useUploadSeoDefaultOgImage() {
  const invalidateSeo = useInvalidateSeo()

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (percentage: number) => void
    }) => uploadSeoDefaultOgImage(file, onProgress),
    onSuccess: invalidateSeo,
  })
}

export function useDeleteSeoDefaultOgImage() {
  const invalidateSeo = useInvalidateSeo()

  return useMutation({
    mutationFn: deleteSeoDefaultOgImage,
    onSuccess: invalidateSeo,
  })
}

export function useUploadPageSeoOgImage() {
  const invalidateSeo = useInvalidateSeo()

  return useMutation({
    mutationFn: ({
      pageKey,
      file,
      onProgress,
    }: {
      pageKey: SeoPageKey
      file: File
      onProgress?: (percentage: number) => void
    }) => uploadPageSeoOgImage(pageKey, file, onProgress),
    onSuccess: invalidateSeo,
  })
}

export function useDeletePageSeoOgImage() {
  const invalidateSeo = useInvalidateSeo()

  return useMutation({
    mutationFn: (pageKey: SeoPageKey) => deletePageSeoOgImage(pageKey),
    onSuccess: invalidateSeo,
  })
}
