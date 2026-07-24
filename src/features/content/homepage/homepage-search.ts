export const homePageRoutePath = '/conteudo/pagina-inicial'

const homepageSections = [
  'secao-principal',
  'industria',
  'operacoes',
] as const

export type HomePageSection = (typeof homepageSections)[number]

export interface HomePageSearch {
  readonly aba: HomePageSection
}

const defaultSection: HomePageSection = 'secao-principal'

export function isHomePageSection(
  value: unknown,
): value is HomePageSection {
  return (
    typeof value === 'string' &&
    homepageSections.some((section: HomePageSection) => section === value)
  )
}

export function validateHomePageSearch(
  search: Record<string, unknown>,
): HomePageSearch {
  return {
    aba: isHomePageSection(search['aba']) ? search['aba'] : defaultSection,
  }
}
