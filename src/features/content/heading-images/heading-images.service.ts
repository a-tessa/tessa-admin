import { authenticatedRequest, authenticatedUploadRequest } from '@/shared/lib/api'
import type { HeadingImagePageKey, HeadingImagesResponse } from './types'

const BASE_PATH = '/api/content/admin/heading-images'

export async function fetchHeadingImages(): Promise<HeadingImagesResponse> {
  return authenticatedRequest<HeadingImagesResponse>(BASE_PATH)
}

export async function upsertHeadingImage(
  pageKey: HeadingImagePageKey,
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<HeadingImagesResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return authenticatedUploadRequest<HeadingImagesResponse>(
    `${BASE_PATH}/${pageKey}`,
    formData,
    onProgress,
  )
}

export async function deleteHeadingImage(
  pageKey: HeadingImagePageKey,
): Promise<HeadingImagesResponse> {
  return authenticatedRequest<HeadingImagesResponse>(`${BASE_PATH}/${pageKey}`, {
    method: 'DELETE',
  })
}
