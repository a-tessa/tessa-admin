export const SEO_PAGE_KEYS = [
  'home',
  'quem-somos',
  'servicos',
  'representantes',
  'blog',
  'downloads',
  'galeria',
  'contato',
  'nao-encontrada',
] as const

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number]

export const SEO_PAGE_LABELS = {
  home: 'Página inicial',
  'quem-somos': 'Quem Somos',
  servicos: 'Serviços',
  representantes: 'Representantes',
  blog: 'Blog',
  downloads: 'Downloads',
  galeria: 'Galeria',
  contato: 'Contato',
  'nao-encontrada': 'Página não encontrada',
} as const satisfies Record<SeoPageKey, string>

export const SEO_PAGE_PATHS = {
  home: '/',
  'quem-somos': '/quem-somos',
  servicos: '/servicos',
  representantes: '/representantes',
  blog: '/blog',
  downloads: '/downloads',
  galeria: '/galeria',
  contato: '/contato',
  'nao-encontrada': '/404',
} as const satisfies Record<SeoPageKey, string>

export const SEO_PAGE_PLACEHOLDERS: Record<
  SeoPageKey,
  { title: string; description: string }
> = {
  home: {
    title: 'Estruturas metálicas e energia solar para projetos industriais',
    description:
      'Estruturas metálicas, perfis sob medida e energia solar para empresas que buscam engenharia aplicada, produção industrial e previsibilidade na execução.',
  },
  'quem-somos': {
    title: 'Quem Somos',
    description:
      'Conheça a Tessa: história, indústria de estruturas metálicas galvanizadas e os pilares de Missão, Visão e Valores.',
  },
  servicos: {
    title: 'Serviços',
    description:
      'Conheça os cenários e soluções Tessa: estruturas metálicas, energia solar e engenharia aplicada para obra e produção.',
  },
  representantes: {
    title: 'Representantes',
    description:
      'Atendimento próximo, suporte técnico e agilidade para o seu projeto.',
  },
  blog: {
    title: 'Blog',
    description:
      'Descubra conteúdos valiosos e conselhos de especialistas da nossa equipe experiente para elevar seu conhecimento e ajudar você a tomar uma decisão mais segura na hora de contratar a Tessa.',
  },
  downloads: {
    title: 'Downloads',
    description:
      'Apresentações, folders e manuais das estruturas Tessa. Baixe os materiais no seu idioma.',
  },
  galeria: {
    title: 'Galeria',
    description:
      'Fotos e vídeos das estruturas e operações Tessa. Explore o acervo por categoria.',
  },
  contato: {
    title: 'Contato',
    description:
      'Fale com nossa equipe para tirar dúvidas, solicitar orçamento ou conhecer nossas soluções.',
  },
  'nao-encontrada': {
    title: 'Página não encontrada',
    description:
      'A página que você procura não existe ou foi movida. Volte à página inicial da Tessa.',
  },
}

export interface PageSeoEntry {
  metaTitle: string
  metaDescription: string
  focusKeyword?: string
  ogImageUrl?: string
  socialTitle?: string
  socialDescription?: string
  canonicalUrl?: string
  noIndex: boolean
  noFollow?: boolean
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: number
}

export type PageSeo = Partial<Record<SeoPageKey, PageSeoEntry>>

export interface SeoDefaults {
  siteName: string
  titleTemplate: string
  defaultMetaDescription: string
  keywords: string[]
  defaultOgImageUrl?: string
  googleSiteVerification?: string
  bingSiteVerification?: string
  twitterSite?: string
  allowIndexing: boolean
}

export interface SeoDefaultsResponse {
  seoDefaults: SeoDefaults
}

export interface PageSeoResponse {
  pageSeo: PageSeo
}
