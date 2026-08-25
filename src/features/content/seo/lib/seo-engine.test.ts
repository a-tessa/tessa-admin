import { describe, expect, it } from 'vitest'
import { runSeoChecks } from './seo-checks'
import { scoreSeoChecks } from './seo-score'
import {
  applyTitleTemplate,
  measureTextWidth,
  SERP_TITLE_DESKTOP_PX,
  SERP_TITLE_FONT,
  truncateToWidth,
} from './text-width'

const defaults = {
  siteName: 'Tessa Tecnologia e Desenvolvimento LTDA',
  titleTemplate: '%s | Tessa',
  defaultMetaDescription:
    'Aço galvanizado. Engenharia aplicada. Produção industrial.',
  allowIndexing: true,
}

describe('text-width', () => {
  it('mede strings de M mais largas do que strings de i', () => {
    const wide = measureTextWidth('MMMMMMMMMM', SERP_TITLE_FONT)
    const narrow = measureTextWidth('iiiiiiiiii', SERP_TITLE_FONT)
    expect(wide).toBeGreaterThan(narrow)
  })

  it('trunca por pixel, não por quantidade de caracteres', () => {
    const wide = 'M'.repeat(40)
    const truncated = truncateToWidth(wide, SERP_TITLE_FONT, SERP_TITLE_DESKTOP_PX)
    expect(truncated.endsWith('...')).toBe(true)
    expect(measureTextWidth(truncated, SERP_TITLE_FONT)).toBeLessThanOrEqual(
      SERP_TITLE_DESKTOP_PX,
    )
  })

  it('aplica o modelo de título no lugar de %s', () => {
    expect(applyTitleTemplate('Blog', '%s | Tessa')).toBe('Blog | Tessa')
  })
})

describe('runSeoChecks', () => {
  it('marca erro quando o modelo de título não tem %s', () => {
    const checks = runSeoChecks({
      seoDefaults: { ...defaults, titleTemplate: 'Tessa' },
      pageSeo: {},
    })
    const template = checks.find(
      (check) => check.id === 'defaults-template-placeholder',
    )
    expect(template?.severity).toBe('error')
  })

  it('detecta títulos e descrições duplicados', () => {
    const sharedTitle = 'Estruturas metálicas para empresas'
    const sharedDescription =
      'Estruturas metálicas, perfis sob medida e energia solar para empresas industriais no Brasil.'
    const checks = runSeoChecks({
      seoDefaults: defaults,
      pageSeo: {
        home: {
          metaTitle: sharedTitle,
          metaDescription: sharedDescription,
          noIndex: false,
        },
        servicos: {
          metaTitle: sharedTitle,
          metaDescription: sharedDescription,
          noIndex: false,
        },
      },
    })

    expect(
      checks.some(
        (check) =>
          check.severity === 'error' && check.id.startsWith('duplicate-title-'),
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.severity === 'error' &&
          check.id.startsWith('duplicate-description-'),
      ),
    ).toBe(true)
  })

  it('avisa título que estoura o limite de pixel mesmo com poucos caracteres largos', () => {
    const checks = runSeoChecks({
      seoDefaults: defaults,
      pageSeo: {
        home: {
          metaTitle: 'W'.repeat(35),
          metaDescription:
            'Descrição com mais de cento e vinte caracteres para passar do aviso de texto curto e ainda caber no recorte do Google em desktop.',
          noIndex: false,
        },
      },
    })

    expect(
      checks.some(
        (check) =>
          check.id === 'page-home-title-long' && check.severity === 'warning',
      ),
    ).toBe(true)
  })

  it('avisa quando a indexação do site está desligada', () => {
    const checks = runSeoChecks({
      seoDefaults: { ...defaults, allowIndexing: false },
      pageSeo: {},
    })
    expect(
      checks.find((check) => check.id === 'defaults-allow-indexing')?.severity,
    ).toBe('warning')
  })

  it('avisa título e descrição sociais longos, canonical problemática e noFollow', () => {
    const checks = runSeoChecks({
      seoDefaults: defaults,
      pageSeo: {
        home: {
          metaTitle: 'Estruturas metálicas para empresas',
          metaDescription:
            'Estruturas metálicas, perfis sob medida e energia solar para empresas industriais no Brasil que buscam previsibilidade.',
          socialTitle: 'S'.repeat(91),
          socialDescription: 'D'.repeat(201),
          canonicalUrl: '/caminho-que-nao-existe',
          noIndex: false,
          noFollow: true,
          priority: 1,
        },
        'quem-somos': {
          metaTitle: 'Quem somos na indústria de estruturas metálicas',
          metaDescription:
            'História, fábrica e pilares da Tessa em estruturas metálicas galvanizadas para empresas que precisam de engenharia aplicada.',
          canonicalUrl: 'https://origem.example/artigo',
          noIndex: false,
        },
        servicos: {
          metaTitle: 'Serviços de estruturas metálicas para a indústria',
          metaDescription:
            'Cenários e soluções Tessa em estruturas metálicas, energia solar e engenharia aplicada para obra e produção industrial.',
          canonicalUrl: '/servicos',
          noIndex: false,
        },
        contato: {
          metaTitle: 'Fale com a Tessa sobre estruturas metálicas',
          metaDescription:
            'Atendimento para orçamento, dúvidas técnicas e projetos de estruturas metálicas galvanizadas em todo o Brasil.',
          canonicalUrl: '/404',
          noIndex: false,
        },
        'nao-encontrada': {
          metaTitle: 'Página não encontrada nas estruturas Tessa',
          metaDescription:
            'A página pedida não existe ou mudou de endereço. Volte à inicial da Tessa para continuar a navegação no site.',
          noIndex: true,
        },
      },
    })

    expect(
      checks.some(
        (check) =>
          check.id === 'page-home-social-title-long' &&
          check.severity === 'warning',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-home-social-description-long' &&
          check.severity === 'warning',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-home-canonical-unknown' &&
          check.severity === 'warning',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-home-canonical-priority-conflict' &&
          check.severity === 'error',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-home-nofollow' && check.severity === 'warning',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-quem-somos-canonical-external' &&
          check.severity === 'warning',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-servicos-canonical-self' &&
          check.severity === 'warning',
      ),
    ).toBe(true)
    expect(
      checks.some(
        (check) =>
          check.id === 'page-contato-canonical-noindex-target' &&
          check.severity === 'warning',
      ),
    ).toBe(true)
  })

  it('dá nota 100 quando padrões e uma página estão preenchidos sem avisos', () => {
    const checks = runSeoChecks({
      seoDefaults: {
        ...defaults,
        twitterSite: '@tessaeng',
        defaultOgImageUrl: 'https://blob.example/og.webp',
      },
      pageSeo: {
        home: {
          metaTitle: 'Estruturas metálicas para empresas',
          metaDescription:
            'Estruturas metálicas, perfis sob medida e energia solar para empresas que buscam engenharia aplicada e previsibilidade na obra.',
          focusKeyword: 'estruturas metálicas',
          ogImageUrl: 'https://blob.example/home-og.webp',
          socialTitle: 'Estruturas Tessa',
          socialDescription: 'Engenharia aplicada em aço galvanizado.',
          noIndex: false,
          noFollow: false,
        },
      },
    })

    expect(checks.every((check) => check.severity === 'ok')).toBe(true)
    expect(scoreSeoChecks(checks)).toBe(100)
  })
})

describe('scoreSeoChecks', () => {
  it('devolve 100 quando todos os checks estão ok', () => {
    expect(
      scoreSeoChecks([
        {
          id: 'a',
          severity: 'ok',
          message: 'ok',
          help: 'help',
        },
      ]),
    ).toBe(100)
  })

  it('penaliza erros mais do que avisos', () => {
    const withWarning = scoreSeoChecks([
      { id: 'ok', severity: 'ok', message: '', help: '' },
      { id: 'warn', severity: 'warning', message: '', help: '' },
    ])
    const withError = scoreSeoChecks([
      { id: 'ok', severity: 'ok', message: '', help: '' },
      { id: 'err', severity: 'error', message: '', help: '' },
    ])
    expect(withError).toBeLessThan(withWarning)
  })
})
