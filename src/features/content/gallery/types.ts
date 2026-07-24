export type GalleryMediaKind = 'photo' | 'video'

export interface GalleryMediaItemAdmin {
  id: string
  kind: GalleryMediaKind
  alt: string
  caption: string | null
  categorySlug: string | null
  order: number
  imageUrl: string | null
  imagePathname: string | null
  imageMimeType: string | null
  imageSizeBytes: number | null
  imageOriginalFilename: string | null
  youtubeUrl: string | null
  youtubeVideoId: string | null
  createdAt: string
  updatedAt: string
  createdById: string
}

export interface GalleryMediaItemsAdminListResponse {
  items: GalleryMediaItemAdmin[]
}

export interface GalleryMediaItemAdminResponse {
  item: GalleryMediaItemAdmin
}

export interface CreateGalleryVideoInput {
  youtubeUrl: string
  alt: string
  caption?: string | null
  categorySlug?: string | null
  order?: number
}

export interface UpdateGalleryMediaItemInput {
  alt?: string
  caption?: string | null
  categorySlug?: string | null
  order?: number
  youtubeUrl?: string
}

export interface ReorderGalleryMediaInput {
  kind: GalleryMediaKind
  orderedIds: string[]
}
