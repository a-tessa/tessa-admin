import { describe, expect, it } from 'vitest'
import { buildPublicationSummary } from './publication-summary'

describe('resumo de publicação', () => {
  it('resume seções globais e diferenças da galeria de Operações', () => {
    const publishedContent = {
      heroSection: [{ title: 'Antes' }],
      operationSection: {
        images: [
          { url: 'https://cdn.example.com/a.webp', alt: 'A' },
          { url: 'https://cdn.example.com/b.webp', alt: 'B' },
          { url: 'https://cdn.example.com/c.webp', alt: 'C' },
        ],
      },
      clients: [{ id: 'asset-1', name: 'Cliente A' }],
    }
    const content = {
      heroSection: [{ title: 'Depois' }],
      operationSection: {
        images: [
          { url: 'https://cdn.example.com/c.webp', alt: 'C' },
          { url: 'https://cdn.example.com/a.webp', alt: 'A' },
          { url: 'https://cdn.example.com/d.webp', alt: 'D' },
        ],
      },
      clients: [{ id: 'draft-only-id', name: 'Cliente A' }],
    }

    const summary = buildPublicationSummary(content, publishedContent)

    expect(summary.changedSections.map((section) => section.label)).toEqual([
      'Seção Principal',
      'Operações',
    ])
    expect(summary.operations).toEqual({
      added: 1,
      removed: 1,
      reordered: 2,
    })
  })

  it('lista vídeos próprios e fallbacks completos da Indústria', () => {
    const summary = buildPublicationSummary(
      {
        industrySection: {
          titlePrefix: 'A força da',
          title: 'indústria',
          subtitle: 'Texto',
          videos: {
            'pt-BR': {
              url: 'https://youtube.com/watch?v=pt',
              startSeconds: 8,
            },
            es: {
              url: 'https://youtube.com/watch?v=es',
              startSeconds: 5,
            },
          },
        },
      },
      null,
    )

    expect(summary.industryVideos).toEqual({
      ownLocales: ['pt-BR', 'es'],
      fallbackLocales: ['en'],
    })
  })

  it('bloqueia uma galeria presente com menos de seis imagens', () => {
    const summary = buildPublicationSummary(
      {
        operationSection: {
          images: Array.from({ length: 5 }, (_, index) => ({
            url: `https://cdn.example.com/${String(index)}.webp`,
            alt: `Imagem ${String(index)}`,
          })),
        },
      },
      null,
    )

    expect(summary.blockers).toEqual([
      expect.objectContaining({
        tab: 'operacoes',
        message: expect.stringContaining('seis imagens'),
      }),
    ])
  })

  it('continua nomeando alterações de outras áreas da publicação global', () => {
    const summary = buildPublicationSummary(
      {
        servicesPages: [{ slug: 'nova' }],
        instagramSelection: { mediaIds: ['1', '2', '3'] },
      },
      {
        servicesPages: [],
        instagramSelection: { mediaIds: ['4', '5', '6'] },
      },
    )

    expect(summary.changedSections.map((section) => section.label)).toEqual([
      'Serviços',
      'Instagram',
    ])
  })

  it('nomeia alterações das imagens dos cabeçalhos', () => {
    const summary = buildPublicationSummary(
      {
        headingImages: {
          blog: { url: 'https://cdn.example.com/blog.webp' },
        },
      },
      {
        headingImages: {},
      },
    )

    expect(summary.changedSections.map((section) => section.label)).toEqual([
      'Imagens dos cabeçalhos',
    ])
  })
})
