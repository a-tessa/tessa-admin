import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { headingImagesKeys, headingImagesQuery } from '../heading-images.queries'
import { deleteHeadingImage, upsertHeadingImage } from '../heading-images.service'
import type { HeadingImagePageKey } from '../types'

function useInvalidateHeadingImages(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: headingImagesKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useHeadingImages() {
  return useQuery(headingImagesQuery())
}

export function useUpsertHeadingImage() {
  const invalidateHeadingImages = useInvalidateHeadingImages()

  return useMutation({
    mutationFn: ({
      pageKey,
      file,
      onProgress,
    }: {
      pageKey: HeadingImagePageKey
      file: File
      onProgress?: (percentage: number) => void
    }) => upsertHeadingImage(pageKey, file, onProgress),
    onSuccess: invalidateHeadingImages,
  })
}

export function useDeleteHeadingImage() {
  const invalidateHeadingImages = useInvalidateHeadingImages()

  return useMutation({
    mutationFn: (pageKey: HeadingImagePageKey) => deleteHeadingImage(pageKey),
    onSuccess: invalidateHeadingImages,
  })
}
