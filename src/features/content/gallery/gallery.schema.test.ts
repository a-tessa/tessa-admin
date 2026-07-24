import { describe, expect, it } from 'vitest'
import {
  describeGalleryPhotoRejection,
  galleryPhotoFormSchema,
  galleryVideoFormSchema,
  isAcceptedGalleryPhotoFile,
  MAX_GALLERY_ALT_LENGTH,
  MAX_GALLERY_PHOTO_BYTES,
} from './gallery.schema'

describe('gallery.schema', () => {
  it('accepts a valid YouTube video form and rejects invalid URLs', () => {
    expect(
      galleryVideoFormSchema.safeParse({
        youtubeUrl: 'https://www.youtube.com/watch?v=EeLYcZsdYrw',
        alt: 'Linha de produção',
        caption: 'Tour',
        categorySlug: 'carport',
      }).success,
    ).toBe(true)

    expect(
      galleryVideoFormSchema.safeParse({
        youtubeUrl: 'https://example.com/video',
        alt: 'Vídeo',
      }).success,
    ).toBe(false)
  })

  it('enforces alt/caption limits and caption distinct from alt', () => {
    expect(
      galleryPhotoFormSchema.safeParse({
        alt: 'a'.repeat(MAX_GALLERY_ALT_LENGTH + 1),
      }).success,
    ).toBe(false)

    expect(
      galleryPhotoFormSchema.safeParse({
        alt: 'Mesmo',
        caption: 'Mesmo',
      }).success,
    ).toBe(false)
  })

  it('validates photo file type and size', () => {
    const valid = new File([new Uint8Array([1, 2, 3])], 'foto.jpg', {
      type: 'image/jpeg',
    })
    expect(isAcceptedGalleryPhotoFile(valid)).toBe(true)

    const oversized = new File(
      [new Uint8Array(MAX_GALLERY_PHOTO_BYTES + 1)],
      'grande.jpg',
      { type: 'image/jpeg' },
    )
    expect(isAcceptedGalleryPhotoFile(oversized)).toBe(false)
    expect(describeGalleryPhotoRejection(oversized)).toContain('MB')
  })
})
