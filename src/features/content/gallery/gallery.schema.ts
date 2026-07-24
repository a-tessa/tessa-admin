import { z } from 'zod'
import { getYouTubeVideoId } from '@/features/content/industry/industry.schema'

export const MAX_GALLERY_PHOTOS = 120
export const MAX_GALLERY_VIDEOS = 60
export const MAX_GALLERY_ALT_LENGTH = 100
export const MAX_GALLERY_CAPTION_LENGTH = 300
export const MAX_GALLERY_PHOTO_BYTES = 3 * 1024 * 1024
export const GALLERY_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'

function refineCaptionDiffersFromAlt(
  value: { alt: string; caption?: string | undefined },
  context: z.RefinementCtx,
): void {
  const caption = value.caption?.trim()
  if (caption && caption === value.alt.trim()) {
    context.addIssue({
      code: 'custom',
      message: 'A legenda deve ser diferente do texto alternativo.',
      path: ['caption'],
    })
  }
}

export const galleryVideoFormSchema = z
  .object({
    youtubeUrl: z
      .string()
      .trim()
      .min(1, 'Informe a URL do YouTube.')
      .refine(
        (url) => getYouTubeVideoId(url) !== null,
        'Informe uma URL válida do YouTube.',
      ),
    alt: z
      .string()
      .trim()
      .min(1, 'Texto alternativo é obrigatório.')
      .max(MAX_GALLERY_ALT_LENGTH),
    caption: z.string().trim().max(MAX_GALLERY_CAPTION_LENGTH).optional(),
    categorySlug: z.string().optional(),
  })
  .superRefine(refineCaptionDiffersFromAlt)

export const galleryPhotoFormSchema = z
  .object({
    alt: z
      .string()
      .trim()
      .min(1, 'Texto alternativo é obrigatório.')
      .max(MAX_GALLERY_ALT_LENGTH),
    caption: z.string().trim().max(MAX_GALLERY_CAPTION_LENGTH).optional(),
    categorySlug: z.string().optional(),
  })
  .superRefine(refineCaptionDiffersFromAlt)

export type GalleryVideoFormValues = z.infer<typeof galleryVideoFormSchema>
export type GalleryPhotoFormValues = z.infer<typeof galleryPhotoFormSchema>

export function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

export function isAcceptedGalleryPhotoFile(file: File): boolean {
  const mimeOk = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const extension = file.name.split('.').pop()?.toLowerCase()
  const extensionOk =
    extension === 'jpg' ||
    extension === 'jpeg' ||
    extension === 'png' ||
    extension === 'webp'

  return (mimeOk || extensionOk) && file.size > 0 && file.size <= MAX_GALLERY_PHOTO_BYTES
}

export function describeGalleryPhotoRejection(file: File): string {
  if (file.size === 0) {
    return 'Arquivo vazio.'
  }
  if (file.size > MAX_GALLERY_PHOTO_BYTES) {
    return `Arquivo maior do que ${String(MAX_GALLERY_PHOTO_BYTES / (1024 * 1024))} MB.`
  }
  return 'Tipo de arquivo inválido. Envie JPEG, PNG ou WebP.'
}

export { getYouTubeVideoId }
