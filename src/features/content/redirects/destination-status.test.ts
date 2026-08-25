import { describe, expect, it } from 'vitest'
import { isSlugChangeDestinationMissing } from './destination-status'

const live = {
  blogSlugs: new Set(['post-novo']),
  serviceSlugs: new Set(['estrutura-carport']),
}

describe('isSlugChangeDestinationMissing', () => {
  it('marca redirecionamento automático de artigo excluído', () => {
    expect(
      isSlugChangeDestinationMissing(
        {
          source: 'slugChange',
          toPath: '/blog/post-novo',
          entityType: 'blogArticle',
        },
        live,
      ),
    ).toBe(false)
    expect(
      isSlugChangeDestinationMissing(
        {
          source: 'slugChange',
          toPath: '/blog/apagado',
          entityType: 'blogArticle',
        },
        live,
      ),
    ).toBe(true)
  })

  it('não marca redirecionamento manual', () => {
    expect(
      isSlugChangeDestinationMissing(
        {
          source: 'manual',
          toPath: '/blog/apagado',
          entityType: 'blogArticle',
        },
        live,
      ),
    ).toBe(false)
  })
})
