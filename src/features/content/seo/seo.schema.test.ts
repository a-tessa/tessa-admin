import { describe, expect, it } from 'vitest'
import {
  defaultPageSeoFormValues,
  defaultSeoDefaultsFormValues,
  normalizeCanonicalInput,
  parseKeywordsText,
  robotsFromBooleans,
  seoDefaultsFormSchema,
  toPageSeoFormValues,
  toPageSeoInput,
  toSeoDefaultsFormValues,
  toSeoDefaultsInput,
} from './seo.schema'

describe('seo.schema', () => {
  it('usa os padrões atuais do site quando a seção ainda não existe', () => {
    expect(toSeoDefaultsFormValues(null)).toEqual(defaultSeoDefaultsFormValues)
    expect(toPageSeoFormValues(null)).toEqual(defaultPageSeoFormValues)
  })

  it('converte palavras-chave separadas por vírgula e remove duplicatas', () => {
    expect(parseKeywordsText(' Carport, Carport, Aço galvanizado , ')).toEqual([
      'Carport',
      'Aço galvanizado',
    ])
  })

  it('rejeita modelo de título sem %s', () => {
    expect(
      seoDefaultsFormSchema.safeParse({
        ...defaultSeoDefaultsFormValues,
        titleTemplate: 'Tessa',
      }).success,
    ).toBe(false)
  })

  it('omite páginas vazias no payload e preserva imagem Open Graph', () => {
    const formValues = toPageSeoFormValues({
      home: {
        metaTitle: 'Estruturas metálicas para empresas',
        metaDescription:
          'Estruturas metálicas, perfis sob medida e energia solar para empresas.',
        ogImageUrl: 'https://blob.example/home-og.webp',
        noIndex: false,
        changeFrequency: 'weekly',
        priority: 1,
      },
    })

    expect(toPageSeoInput(formValues)).toEqual({
      home: {
        metaTitle: 'Estruturas metálicas para empresas',
        metaDescription:
          'Estruturas metálicas, perfis sob medida e energia solar para empresas.',
        ogImageUrl: 'https://blob.example/home-og.webp',
        noIndex: false,
        noFollow: false,
        changeFrequency: 'weekly',
        priority: 1,
      },
    })
  })

  it('preserva a imagem Open Graph padrão ao salvar os textos', () => {
    expect(
      toSeoDefaultsInput({
        ...defaultSeoDefaultsFormValues,
        defaultOgImageUrl: 'https://blob.example/og.webp',
      }).defaultOgImageUrl,
    ).toBe('https://blob.example/og.webp')
  })

  it('converte o dropdown de robots para noIndex/noFollow e de volta', () => {
    expect(robotsFromBooleans(false, false)).toBe('index, follow')
    expect(robotsFromBooleans(true, false)).toBe('noindex, follow')
    expect(robotsFromBooleans(false, true)).toBe('index, nofollow')
    expect(robotsFromBooleans(true, true)).toBe('noindex, nofollow')

    const formValues = toPageSeoFormValues({
      home: {
        metaTitle: 'Estruturas metálicas para empresas',
        metaDescription:
          'Estruturas metálicas, perfis sob medida e energia solar para empresas.',
        noIndex: true,
        noFollow: true,
      },
    })

    expect(formValues.pages.home.robots).toBe('noindex, nofollow')
    expect(toPageSeoInput(formValues).home).toMatchObject({
      noIndex: true,
      noFollow: true,
    })
  })

  it('omite título social, descrição social e canonical vazios no payload', () => {
    const formValues = toPageSeoFormValues({
      home: {
        metaTitle: 'Estruturas metálicas para empresas',
        metaDescription:
          'Estruturas metálicas, perfis sob medida e energia solar para empresas.',
        noIndex: false,
      },
    })
    formValues.pages.home.socialTitle = '   '
    formValues.pages.home.socialDescription = ''
    formValues.pages.home.canonicalUrl = '  '

    expect(toPageSeoInput(formValues).home).toEqual({
      metaTitle: 'Estruturas metálicas para empresas',
      metaDescription:
        'Estruturas metálicas, perfis sob medida e energia solar para empresas.',
      noIndex: false,
      noFollow: false,
    })
  })

  it('normaliza canonical do próprio domínio para caminho relativo, com e sem prefixo de idioma', () => {
    const siteOrigin = 'https://tessa.com.br'

    expect(
      normalizeCanonicalInput(
        'https://tessa.com.br/en/quem-somos',
        siteOrigin,
      ),
    ).toEqual({
      canonicalUrl: '/quem-somos',
      convertedFromOwnHost: true,
    })
    expect(
      normalizeCanonicalInput('https://tessa.com.br/quem-somos/', siteOrigin),
    ).toEqual({
      canonicalUrl: '/quem-somos',
      convertedFromOwnHost: true,
    })
    expect(
      normalizeCanonicalInput('https://origem.example/artigo', siteOrigin),
    ).toEqual({
      canonicalUrl: 'https://origem.example/artigo',
      convertedFromOwnHost: false,
    })
    expect(
      normalizeCanonicalInput('http://tessa.com.br/quem-somos', siteOrigin),
    ).toEqual({
      canonicalUrl: '/quem-somos',
      convertedFromOwnHost: true,
    })

    const formValues = toPageSeoFormValues({
      home: {
        metaTitle: 'Estruturas metálicas para empresas',
        metaDescription:
          'Estruturas metálicas, perfis sob medida e energia solar para empresas.',
        canonicalUrl: 'https://tessa.com.br/es/servicos',
        noIndex: false,
      },
    })

    expect(
      toPageSeoInput(formValues, siteOrigin).home?.canonicalUrl,
    ).toBe('/servicos')
  })
})
