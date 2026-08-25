import {
  applyTitleTemplate,
  measureTextWidth,
  RECOMMENDED_DESCRIPTION_MAX,
  RECOMMENDED_DESCRIPTION_MIN,
  RECOMMENDED_TITLE_MAX,
  RECOMMENDED_TITLE_MIN,
  SERP_DESCRIPTION_DESKTOP_PX,
  SERP_DESCRIPTION_FONT,
  SERP_TITLE_DESKTOP_PX,
  SERP_TITLE_FONT,
} from './text-width'
import {
  SEO_PAGE_KEYS,
  SEO_PAGE_LABELS,
  SEO_PAGE_PATHS,
  type PageSeo,
  type SeoDefaults,
  type SeoPageKey,
} from '../types'

export type SeoCheckSeverity = 'error' | 'warning' | 'ok'

export interface SeoCheck {
  id: string
  severity: SeoCheckSeverity
  message: string
  help: string
  pageKey?: SeoPageKey
}

function isFilled(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeForCompare(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR')
}

function composedTitle(title: string, template: string): string {
  return applyTitleTemplate(title.trim(), template.trim() || '%s | Tessa')
}

function hasBrand(text: string, siteName: string): boolean {
  const haystack = normalizeForCompare(text)
  const brandTokens = [siteName, 'Tessa']
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => normalizeForCompare(token))

  return brandTokens.some((token) => haystack.includes(token))
}

function templateBrand(titleTemplate: string): string {
  return titleTemplate.replaceAll('%s', '').replaceAll('|', '').trim()
}

function pageHasCopy(
  entry: PageSeo[SeoPageKey] | undefined,
): entry is NonNullable<PageSeo[SeoPageKey]> {
  if (!entry) return false
  return isFilled(entry.metaTitle) || isFilled(entry.metaDescription)
}

export function runSeoChecks(input: {
  seoDefaults: Pick<
    SeoDefaults,
    | 'siteName'
    | 'titleTemplate'
    | 'defaultMetaDescription'
    | 'defaultOgImageUrl'
    | 'allowIndexing'
    | 'twitterSite'
  >
  pageSeo: PageSeo
}): SeoCheck[] {
  const checks: SeoCheck[] = []
  const { seoDefaults, pageSeo } = input
  const titleTemplate = seoDefaults.titleTemplate.trim()

  if (!titleTemplate.includes('%s')) {
    checks.push({
      id: 'defaults-template-placeholder',
      severity: 'error',
      message: 'O modelo de título precisa conter %s.',
      help: 'O Google e o navegador substituem %s pelo título de cada página. Sem o placeholder, todas as páginas ficam com o mesmo título.',
    })
  } else {
    checks.push({
      id: 'defaults-template-placeholder',
      severity: 'ok',
      message: 'O modelo de título inclui %s.',
      help: 'Cada página entra no lugar de %s, com a marca ao lado.',
    })
  }

  if (!seoDefaults.allowIndexing) {
    checks.push({
      id: 'defaults-allow-indexing',
      severity: 'warning',
      message: 'A indexação do site está desligada. Nenhuma página vai aparecer no Google.',
      help: 'Use só em manutenção. Com a indexação desligada, o robots.txt bloqueia buscadores mesmo em produção.',
    })
  } else {
    checks.push({
      id: 'defaults-allow-indexing',
      severity: 'ok',
      message: 'A indexação do site está ligada.',
      help: 'Buscadores podem listar as páginas que não estiverem marcadas como noIndex.',
    })
  }

  if (!isFilled(seoDefaults.defaultMetaDescription)) {
    checks.push({
      id: 'defaults-description',
      severity: 'error',
      message: 'Falta a descrição padrão do site.',
      help: 'A descrição padrão aparece quando uma página ainda não tem a sua. Ela não ranqueia sozinha, mas aparece no resultado e influencia o clique.',
    })
  }

  if (!isFilled(seoDefaults.defaultOgImageUrl)) {
    checks.push({
      id: 'defaults-og-image',
      severity: 'warning',
      message: 'Não há imagem Open Graph padrão.',
      help: 'Links compartilhados no WhatsApp, LinkedIn e outros usam essa imagem quando a página não tem uma própria.',
    })
  }

  if (!isFilled(seoDefaults.twitterSite)) {
    checks.push({
      id: 'defaults-twitter-site',
      severity: 'warning',
      message: 'Não há handle do X nos padrões globais.',
      help: 'Sem @perfil, o cartão do X não credita a conta oficial da Tessa.',
    })
  } else {
    checks.push({
      id: 'defaults-twitter-site',
      severity: 'ok',
      message: 'O handle do X está preenchido.',
      help: 'twitter:site vai creditar o perfil nos cartões de compartilhamento.',
    })
  }

  const filledPages = SEO_PAGE_KEYS.filter((pageKey) => pageHasCopy(pageSeo[pageKey]))
  const titles = new Map<string, SeoPageKey[]>()
  const descriptions = new Map<string, SeoPageKey[]>()

  for (const pageKey of filledPages) {
    const entry = pageSeo[pageKey]
    if (!entry) continue
    const title = entry.metaTitle.trim()
    const description = entry.metaDescription.trim()
    const label = SEO_PAGE_LABELS[pageKey]

    if (!isFilled(title)) {
      checks.push({
        id: `page-${pageKey}-title-missing`,
        severity: 'error',
        pageKey,
        message: `${label}: falta o título.`,
        help: 'O título é o principal sinal editável para o Google. Ele deve descrever a página e começar com o termo principal.',
      })
    } else {
      const width = measureTextWidth(
        composedTitle(title, titleTemplate),
        SERP_TITLE_FONT,
      )
      if (title.length < RECOMMENDED_TITLE_MIN) {
        checks.push({
          id: `page-${pageKey}-title-short`,
          severity: 'warning',
          pageKey,
          message: `${label}: o título está curto (${String(title.length)} caracteres).`,
          help: 'Títulos abaixo de 30 caracteres desperdiçam espaço no resultado e costumam ser genéricos demais.',
        })
      } else if (
        title.length > RECOMMENDED_TITLE_MAX ||
        width > SERP_TITLE_DESKTOP_PX
      ) {
        checks.push({
          id: `page-${pageKey}-title-long`,
          severity: 'warning',
          pageKey,
          message: `${label}: o título deve ser cortado no Google.`,
          help: 'O Google corta por largura (~580px no desktop), não por caractere. Títulos com muitas letras largas (M, W) estouram antes.',
        })
      } else {
        checks.push({
          id: `page-${pageKey}-title-length`,
          severity: 'ok',
          pageKey,
          message: `${label}: o título cabe no resultado.`,
          help: 'Cabe no recorte aproximado do Google no desktop.',
        })
      }

      const keyword = entry.focusKeyword?.trim()
      if (isFilled(keyword)) {
        const titleNormalized = normalizeForCompare(title)
        const keywordNormalized = normalizeForCompare(keyword)
        const keywordIndex = titleNormalized.indexOf(keywordNormalized)
        if (keywordIndex < 0) {
          checks.push({
            id: `page-${pageKey}-keyword-missing`,
            severity: 'warning',
            pageKey,
            message: `${label}: o termo principal não aparece no título.`,
            help: 'Quem busca esse termo precisa reconhecê-lo já no título do resultado.',
          })
        } else if (keywordIndex > 12) {
          checks.push({
            id: `page-${pageKey}-keyword-late`,
            severity: 'warning',
            pageKey,
            message: `${label}: o termo principal está longe do começo do título.`,
            help: 'O Google e o visitante leem o começo primeiro. Coloque o termo principal nas primeiras palavras.',
          })
        } else {
          checks.push({
            id: `page-${pageKey}-keyword`,
            severity: 'ok',
            pageKey,
            message: `${label}: o termo principal abre o título.`,
            help: 'O termo aparece no começo, onde tem mais peso visual no resultado.',
          })
        }
      }

      const composed = composedTitle(title, titleTemplate)
      const brandInTitle = hasBrand(title, seoDefaults.siteName)
      const brandInTemplate = hasBrand(
        templateBrand(titleTemplate),
        seoDefaults.siteName,
      )

      if (!hasBrand(composed, seoDefaults.siteName)) {
        checks.push({
          id: `page-${pageKey}-brand-missing`,
          severity: 'warning',
          pageKey,
          message: `${label}: a marca não aparece no título final.`,
          help: 'Inclua a marca no modelo de título (por exemplo %s | Tessa) ou no próprio título da página.',
        })
      } else if (brandInTitle && brandInTemplate) {
        checks.push({
          id: `page-${pageKey}-brand-duplicate`,
          severity: 'warning',
          pageKey,
          message: `${label}: a marca está repetida no título e no modelo.`,
          help: 'Se o modelo já adiciona “| Tessa”, não precisa repetir Tessa no título da página.',
        })
      }

      titles.set(normalizeForCompare(title), [
        ...(titles.get(normalizeForCompare(title)) ?? []),
        pageKey,
      ])
    }

    if (!isFilled(description)) {
      checks.push({
        id: `page-${pageKey}-description-missing`,
        severity: 'error',
        pageKey,
        message: `${label}: falta a descrição.`,
        help: 'A meta description não ranqueia sozinha, mas é o texto cinza do resultado e muda a taxa de clique.',
      })
    } else {
      const width = measureTextWidth(description, SERP_DESCRIPTION_FONT)
      if (description.length < RECOMMENDED_DESCRIPTION_MIN) {
        checks.push({
          id: `page-${pageKey}-description-short`,
          severity: 'warning',
          pageKey,
          message: `${label}: a descrição está curta (${String(description.length)} caracteres).`,
          help: 'Descrições abaixo de 120 caracteres deixam espaço vazio no resultado e convencem menos o clique.',
        })
      } else if (
        description.length > RECOMMENDED_DESCRIPTION_MAX ||
        width > SERP_DESCRIPTION_DESKTOP_PX
      ) {
        checks.push({
          id: `page-${pageKey}-description-long`,
          severity: 'warning',
          pageKey,
          message: `${label}: a descrição deve ser cortada no Google.`,
          help: 'O recorte desktop fica em torno de 920px (~155 caracteres). O que passar some atrás de reticências.',
        })
      } else {
        checks.push({
          id: `page-${pageKey}-description-length`,
          severity: 'ok',
          pageKey,
          message: `${label}: a descrição cabe no resultado.`,
          help: 'Cabe no recorte aproximado do Google no desktop.',
        })
      }

      descriptions.set(normalizeForCompare(description), [
        ...(descriptions.get(normalizeForCompare(description)) ?? []),
        pageKey,
      ])
    }

    if (entry.noIndex) {
      checks.push({
        id: `page-${pageKey}-noindex`,
        severity: 'warning',
        pageKey,
        message: `${label}: esta página não vai aparecer no Google.`,
        help: 'noIndex tira a página da busca e do sitemap. Frequência e prioridade do sitemap são ignoradas nesta página.',
      })
    }

    if (entry.noFollow) {
      checks.push({
        id: `page-${pageKey}-nofollow`,
        severity: 'warning',
        pageKey,
        message: `${label}: os links desta página não passam autoridade.`,
        help: 'nofollow pede que buscadores não sigam os links. Use só quando a página não deve votar em outras URLs.',
      })
    }

    const socialTitle = entry.socialTitle?.trim() ?? ''
    if (socialTitle.length > 90) {
      checks.push({
        id: `page-${pageKey}-social-title-long`,
        severity: 'warning',
        pageKey,
        message: `${label}: o título social passa de 90 caracteres e corta no Facebook e no X.`,
        help: 'Redes sociais cortam o título social por volta de 90 caracteres. Encurte ou deixe vazio para herdar o meta título.',
      })
    }

    const socialDescription = entry.socialDescription?.trim() ?? ''
    if (socialDescription.length > 200) {
      checks.push({
        id: `page-${pageKey}-social-description-long`,
        severity: 'warning',
        pageKey,
        message: `${label}: a descrição social passa de 200 caracteres e corta no Facebook e no X.`,
        help: 'A descrição do cartão é cortada perto de 200 caracteres. Encurte ou deixe vazio para herdar a meta description.',
      })
    }

    const canonicalUrl = entry.canonicalUrl?.trim() ?? ''
    if (isFilled(canonicalUrl)) {
      const isExternal = /^https?:\/\//i.test(canonicalUrl)
      if (isExternal) {
        checks.push({
          id: `page-${pageKey}-canonical-external`,
          severity: 'warning',
          pageKey,
          message: `${label}: a canonical aponta para outro site. Esta página deixa de disputar posição nos três idiomas.`,
          help: 'URL absoluta de outro domínio é usada literal e o hreflang deixa de ser emitido: o conteúdo passa a pertencer à fonte externa.',
        })
      } else {
        if (canonicalUrl === SEO_PAGE_PATHS[pageKey]) {
          checks.push({
            id: `page-${pageKey}-canonical-self`,
            severity: 'warning',
            pageKey,
            message: `${label}: a canonical personalizada é o próprio caminho da página.`,
            help: 'Isso não muda o que o site já gera e só confunde a manutenção. Deixe o campo vazio.',
          })
        }

        const isKnownPath =
          (Object.values(SEO_PAGE_PATHS) as string[]).includes(canonicalUrl) ||
          canonicalUrl.startsWith('/blog/') ||
          canonicalUrl.startsWith('/servicos/')
        if (!isKnownPath) {
          checks.push({
            id: `page-${pageKey}-canonical-unknown`,
            severity: 'warning',
            pageKey,
            message: `${label}: a canonical aponta para um caminho que provavelmente dá 404.`,
            help: 'Use uma das rotas fixas, um artigo em /blog/ ou uma página de serviço em /servicos/.',
          })
        }

        const targetPageKey = SEO_PAGE_KEYS.find(
          (key) => SEO_PAGE_PATHS[key] === canonicalUrl,
        )
        if (targetPageKey && pageSeo[targetPageKey]?.noIndex) {
          checks.push({
            id: `page-${pageKey}-canonical-noindex-target`,
            severity: 'warning',
            pageKey,
            message: `${label}: a canonical aponta para uma página marcada como noIndex.`,
            help: 'Canonicalizar para uma URL fora do índice descarta as duas páginas da busca.',
          })
        }
      }

      const highPriority =
        typeof entry.priority === 'number' && entry.priority >= 0.8
      if (!entry.noIndex && highPriority) {
        checks.push({
          id: `page-${pageKey}-canonical-priority-conflict`,
          severity: 'error',
          pageKey,
          message: `${label}: canonical personalizada e prioridade alta no sitemap se contradizem.`,
          help: 'Canonical diz que outra URL deve ranquear; prioridade alta pede o contrário. Escolha um dos dois sinais.',
        })
      }
    }

    if (!isFilled(entry.ogImageUrl) && !isFilled(seoDefaults.defaultOgImageUrl)) {
      checks.push({
        id: `page-${pageKey}-og-image`,
        severity: 'warning',
        pageKey,
        message: `${label}: sem imagem Open Graph (nem a padrão do site).`,
        help: 'Sem imagem, o link compartilhado aparece sem miniatura.',
      })
    }
  }

  for (const [title, pageKeys] of titles) {
    if (pageKeys.length < 2 || !isFilled(title)) continue
    checks.push({
      id: `duplicate-title-${title}`,
      severity: 'error',
      message: `Título duplicado em ${pageKeys.map((key) => SEO_PAGE_LABELS[key]).join(', ')}.`,
      help: 'Títulos iguais entre páginas são um dos problemas que o Search Console mais reporta. Cada URL precisa de um título único.',
    })
  }

  for (const [description, pageKeys] of descriptions) {
    if (pageKeys.length < 2 || !isFilled(description)) continue
    checks.push({
      id: `duplicate-description-${description}`,
      severity: 'error',
      message: `Descrição duplicada em ${pageKeys.map((key) => SEO_PAGE_LABELS[key]).join(', ')}.`,
      help: 'Descrições iguais fazem o Google tratar as páginas como repetidas e escolhe sozinho o texto do resultado.',
    })
  }

  return checks
}
