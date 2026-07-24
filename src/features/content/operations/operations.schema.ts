import { z } from 'zod'
import type { OperationGalleryItem, OperationImage, OperationSection } from './types'

export const MAX_OPERATION_SECTION_IMAGES = 40
export const MIN_OPERATION_SECTION_IMAGES_FOR_PUBLISH = 6
export const MAX_OPERATION_ALT_LENGTH = 100
export const MAX_OPERATION_CAPTION_LENGTH = 300
export const MAX_OPERATION_IMAGE_BYTES = 3 * 1024 * 1024
export const OPERATION_UPLOAD_CONCURRENCY = 3

export const OPERATION_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const OPERATION_FILE_ACCEPT = OPERATION_ACCEPTED_MIME_TYPES.join(',')

const OPERATION_EXTENSION_BY_MIME: Record<
  (typeof OPERATION_ACCEPTED_MIME_TYPES)[number],
  readonly string[]
> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function isAcceptedOperationFile(file: File): boolean {
  if (file.size <= 0 || file.size > MAX_OPERATION_IMAGE_BYTES) {
    return false
  }

  const mime = file.type as (typeof OPERATION_ACCEPTED_MIME_TYPES)[number]
  if ((OPERATION_ACCEPTED_MIME_TYPES as readonly string[]).includes(mime)) {
    return true
  }

  const lowerName = file.name.toLowerCase()
  return Object.values(OPERATION_EXTENSION_BY_MIME).some((extensions) =>
    extensions.some((extension) => lowerName.endsWith(extension)),
  )
}

export function describeOperationFileRejection(file: File): string {
  if (file.size <= 0) {
    return `O arquivo "${file.name}" está vazio.`
  }

  if (file.size > MAX_OPERATION_IMAGE_BYTES) {
    return `O arquivo "${file.name}" excede o limite de 3 MB.`
  }

  return `O arquivo "${file.name}" precisa ser JPEG, PNG ou WebP.`
}

export const operationImageFormSchema = z
  .object({
    url: z.string().trim().min(1, 'A imagem é obrigatória.'),
    alt: z
      .string()
      .trim()
      .min(1, 'O texto alternativo é obrigatório.')
      .max(
        MAX_OPERATION_ALT_LENGTH,
        'O texto alternativo deve ter no máximo 100 caracteres.',
      ),
    caption: z
      .string()
      .trim()
      .max(
        MAX_OPERATION_CAPTION_LENGTH,
        'A legenda deve ter no máximo 300 caracteres.',
      )
      .optional(),
    meta: z
      .object({
        pathname: z.string().min(1),
        mimeType: z.string().min(1),
        sizeBytes: z.number().int().positive(),
        originalFilename: z.string().min(1),
      })
      .optional(),
  })
  .superRefine((image, ctx): void => {
    const caption = image.caption?.trim() ?? ''
    if (caption.length > 0 && caption === image.alt) {
      ctx.addIssue({
        code: 'custom',
        message: 'A legenda deve ser diferente do texto alternativo.',
        path: ['caption'],
      })
    }
  })

export const operationSectionFormSchema = z.object({
  images: z
    .array(operationImageFormSchema)
    .max(
      MAX_OPERATION_SECTION_IMAGES,
      'A galeria aceita no máximo 40 imagens.',
    ),
})

export type OperationSectionFormValues = z.infer<typeof operationSectionFormSchema>

export function createGalleryClientId(): string {
  return crypto.randomUUID()
}

export function toOperationGalleryItems(
  section: OperationSection | null,
): OperationGalleryItem[] {
  if (!section) return []

  return section.images.map((image) => ({
    clientId: createGalleryClientId(),
    url: image.url,
    previewUrl: image.url,
    alt: image.alt,
    caption: image.caption ?? '',
    status: 'ready' as const,
  }))
}

export function toOperationSectionInput(
  items: OperationGalleryItem[],
): OperationSection {
  const images: OperationImage[] = items
    .filter((item) => item.status === 'ready' && item.url.length > 0)
    .map((item) => {
      const caption = item.caption.trim()
      const image: OperationImage = {
        url: item.url,
        alt: item.alt.trim(),
      }
      if (caption.length > 0) {
        image.caption = caption
      }
      if (item.meta) {
        image.meta = item.meta
      }
      return image
    })

  return { images }
}

export function groupOperationPreviewSlides<T>(
  images: T[],
  size = 4,
): T[][] {
  const slides: T[][] = []
  for (let index = 0; index < images.length; index += size) {
    slides.push(images.slice(index, index + size))
  }
  return slides
}
