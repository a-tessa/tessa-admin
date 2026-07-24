import { useQuery } from '@tanstack/react-query'
import { adminGalleryListQuery } from '../gallery.queries'
import type { GalleryMediaKind } from '../types'

export function useGalleryItems(kind: GalleryMediaKind) {
  return useQuery(adminGalleryListQuery(kind))
}
