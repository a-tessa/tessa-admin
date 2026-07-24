import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createGalleryPhoto,
  createGalleryVideo,
  deleteGalleryMediaItem,
  reorderGalleryMediaItems,
  replaceGalleryPhoto,
  updateGalleryMediaItem,
} from '../gallery.service'
import { galleryKeys } from '../gallery.queries'
import type {
  CreateGalleryVideoInput,
  GalleryMediaKind,
  ReorderGalleryMediaInput,
  UpdateGalleryMediaItemInput,
} from '../types'

function useInvalidateGallery() {
  const queryClient = useQueryClient()
  return async (kind?: GalleryMediaKind) => {
    if (kind) {
      await queryClient.invalidateQueries({ queryKey: galleryKeys.list(kind) })
      return
    }
    await queryClient.invalidateQueries({ queryKey: galleryKeys.all })
  }
}

export function useCreateGalleryVideo() {
  const invalidate = useInvalidateGallery()
  return useMutation({
    mutationFn: (input: CreateGalleryVideoInput) => createGalleryVideo(input),
    onSuccess: async () => {
      await invalidate('video')
    },
  })
}

export function useCreateGalleryPhoto() {
  const invalidate = useInvalidateGallery()
  return useMutation({
    mutationFn: (params: {
      file: File
      alt: string
      caption?: string | null
      categorySlug?: string | null
    }) => createGalleryPhoto(params),
    onSuccess: async () => {
      await invalidate('photo')
    },
  })
}

export function useUpdateGalleryMediaItem() {
  const invalidate = useInvalidateGallery()
  return useMutation({
    mutationFn: (params: {
      id: string
      kind: GalleryMediaKind
      input: UpdateGalleryMediaItemInput
    }) => updateGalleryMediaItem(params.id, params.input),
    onSuccess: async (_data, variables) => {
      await invalidate(variables.kind)
    },
  })
}

export function useReplaceGalleryPhoto() {
  const invalidate = useInvalidateGallery()
  return useMutation({
    mutationFn: (params: { id: string; file: File }) =>
      replaceGalleryPhoto(params.id, params.file),
    onSuccess: async () => {
      await invalidate('photo')
    },
  })
}

export function useReorderGalleryMediaItems() {
  const invalidate = useInvalidateGallery()
  return useMutation({
    mutationFn: (input: ReorderGalleryMediaInput) => reorderGalleryMediaItems(input),
    onSuccess: async (_data, variables) => {
      await invalidate(variables.kind)
    },
  })
}

export function useDeleteGalleryMediaItem() {
  const invalidate = useInvalidateGallery()
  return useMutation({
    mutationFn: (params: { id: string; kind: GalleryMediaKind }) =>
      deleteGalleryMediaItem(params.id),
    onSuccess: async (_data, variables) => {
      await invalidate(variables.kind)
    },
  })
}
