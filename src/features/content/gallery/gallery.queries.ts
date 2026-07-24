import { queryOptions } from '@tanstack/react-query'
import { fetchAdminGalleryItems } from './gallery.service'
import type { GalleryMediaKind } from './types'

export const galleryKeys = {
  all: ['content', 'gallery'] as const,
  lists: () => [...galleryKeys.all, 'list'] as const,
  list: (kind: GalleryMediaKind) => [...galleryKeys.lists(), kind] as const,
}

export function adminGalleryListQuery(kind: GalleryMediaKind) {
  return queryOptions({
    queryKey: galleryKeys.list(kind),
    queryFn: () => fetchAdminGalleryItems(kind),
  })
}
