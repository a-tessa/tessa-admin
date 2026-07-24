import { authenticatedRequest } from '@/shared/lib/api'
import type {
  CreateGalleryVideoInput,
  GalleryMediaItemAdminResponse,
  GalleryMediaItemsAdminListResponse,
  GalleryMediaKind,
  ReorderGalleryMediaInput,
  UpdateGalleryMediaItemInput,
} from './types'

const BASE_PATH = '/api/gallery'

export async function fetchAdminGalleryItems(
  kind: GalleryMediaKind,
): Promise<GalleryMediaItemsAdminListResponse> {
  const params = new URLSearchParams({ kind })
  return authenticatedRequest<GalleryMediaItemsAdminListResponse>(
    `${BASE_PATH}/admin?${params.toString()}`,
  )
}

export async function createGalleryVideo(
  input: CreateGalleryVideoInput,
): Promise<GalleryMediaItemAdminResponse> {
  return authenticatedRequest<GalleryMediaItemAdminResponse>(`${BASE_PATH}/videos`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function createGalleryPhoto(params: {
  file: File
  alt: string
  caption?: string | null
  categorySlug?: string | null
}): Promise<GalleryMediaItemAdminResponse> {
  const formData = new FormData()
  formData.set('file', params.file)
  formData.set('alt', params.alt)
  if (params.caption) {
    formData.set('caption', params.caption)
  }
  if (params.categorySlug) {
    formData.set('categorySlug', params.categorySlug)
  }

  return authenticatedRequest<GalleryMediaItemAdminResponse>(`${BASE_PATH}/photos`, {
    method: 'POST',
    body: formData,
  })
}

export async function updateGalleryMediaItem(
  id: string,
  input: UpdateGalleryMediaItemInput,
): Promise<GalleryMediaItemAdminResponse> {
  return authenticatedRequest<GalleryMediaItemAdminResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function replaceGalleryPhoto(
  id: string,
  file: File,
): Promise<GalleryMediaItemAdminResponse> {
  const formData = new FormData()
  formData.set('file', file)

  return authenticatedRequest<GalleryMediaItemAdminResponse>(
    `${BASE_PATH}/${id}/image`,
    {
      method: 'PUT',
      body: formData,
    },
  )
}

export async function reorderGalleryMediaItems(
  input: ReorderGalleryMediaInput,
): Promise<GalleryMediaItemsAdminListResponse> {
  return authenticatedRequest<GalleryMediaItemsAdminListResponse>(
    `${BASE_PATH}/reorder`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}

export async function deleteGalleryMediaItem(id: string): Promise<undefined> {
  await authenticatedRequest<undefined>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}
