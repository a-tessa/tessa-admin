import { describe, expect, it } from 'vitest'
import {
  HEADING_IMAGE_PAGE_KEYS,
  HEADING_IMAGE_PAGE_LABELS,
} from './types'

describe('heading images feature constants', () => {
  it('covers the seven fixed public pages with labels', () => {
    expect(HEADING_IMAGE_PAGE_KEYS).toEqual([
      'quem-somos',
      'servicos',
      'representantes',
      'blog',
      'downloads',
      'galeria',
      'contato',
    ])

    for (const pageKey of HEADING_IMAGE_PAGE_KEYS) {
      expect(HEADING_IMAGE_PAGE_LABELS[pageKey].length).toBeGreaterThan(0)
    }
  })
})
