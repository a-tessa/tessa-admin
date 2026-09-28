import { describe, expect, it } from 'vitest'
import { isUnpublishedCategorySlug } from './unpublished-category'

describe('categoria ainda não publicada', () => {
  const publishedContent = {
    categories: [
      { slug: 'estruturas', name: 'Estruturas' },
      { slug: 'coberturas', name: 'Coberturas' },
    ],
  }

  it('trata slug ausente do conteúdo publicado como rascunho', () => {
    expect(isUnpublishedCategorySlug('galpoes', publishedContent)).toBe(true)
  })

  it('trata slug presente no conteúdo publicado como publicada', () => {
    expect(isUnpublishedCategorySlug('estruturas', publishedContent)).toBe(
      false,
    )
  })

  it('não avisa quando nenhuma categoria está selecionada', () => {
    expect(isUnpublishedCategorySlug('  ', publishedContent)).toBe(false)
    expect(isUnpublishedCategorySlug('', null)).toBe(false)
  })

  it('trata toda categoria selecionada como rascunho quando nada foi publicado', () => {
    expect(isUnpublishedCategorySlug('estruturas', null)).toBe(true)
    expect(isUnpublishedCategorySlug('estruturas', {})).toBe(true)
  })
})
