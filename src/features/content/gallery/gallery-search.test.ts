import { describe, expect, it } from 'vitest'
import {
  galleryTabToKind,
  isGalleryTab,
  validateGallerySearch,
} from './gallery-search'

describe('gallery-search', () => {
  it('defaults to fotos and accepts videos', () => {
    expect(validateGallerySearch({})).toEqual({ aba: 'fotos' })
    expect(validateGallerySearch({ aba: 'videos' })).toEqual({ aba: 'videos' })
    expect(validateGallerySearch({ aba: 'invalid' })).toEqual({ aba: 'fotos' })
  })

  it('maps tabs to API kinds', () => {
    expect(isGalleryTab('fotos')).toBe(true)
    expect(isGalleryTab('videos')).toBe(true)
    expect(galleryTabToKind('fotos')).toBe('photo')
    expect(galleryTabToKind('videos')).toBe('video')
  })
})
