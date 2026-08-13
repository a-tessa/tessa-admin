export type HomepagePublicationTab =
  | 'secao-principal'
  | 'industria'
  | 'operacoes'
  | 'resultados'
  | 'rodape'

export interface PublicationBlocker {
  id: string
  message: string
  tab: HomepagePublicationTab
}

interface ChangedSection {
  key: string
  label: string
}

interface OperationsDelta {
  added: number
  removed: number
  reordered: number
}

interface IndustryVideoSummary {
  ownLocales: Array<'pt-BR' | 'en' | 'es'>
  fallbackLocales: Array<'en' | 'es'>
}

export interface PublicationSummary {
  changedSections: ChangedSection[]
  operations: OperationsDelta | null
  industryVideos: IndustryVideoSummary | null
  blockers: PublicationBlocker[]
}

const ID_STRIPPED_COLLECTIONS = new Set([
  'nps',
  'representantsBase',
  'categories',
  'clients',
])

const SECTION_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['heroSection', 'Seção Principal'],
  ['industrySection', 'Indústria'],
  ['aboutSection', 'Quem Somos'],
  ['operationSection', 'Operações'],
  ['resultsSection', 'Resultados'],
  ['footerSection', 'Rodapé'],
  ['headingImages', 'Imagens dos cabeçalhos'],
  ['servicesPages', 'Serviços'],
  ['scenerySection', 'Cenários'],
  ['clients', 'Clientes'],
  ['representantsBase', 'Representantes'],
  ['categories', 'Categorias'],
  ['nps', 'Depoimentos'],
  ['instagramSelection', 'Instagram'],
  ['companyInformation', 'Informações da empresa'],
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeContentForComparison(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeContentForComparison(item))
  }

  if (!isPlainObject(value)) return value

  const result: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined) continue

    if (ID_STRIPPED_COLLECTIONS.has(key) && Array.isArray(raw)) {
      result[key] = raw.map((item) => {
        if (!isPlainObject(item)) return normalizeContentForComparison(item)
        const { id: _id, ...rest } = item
        return normalizeContentForComparison(rest)
      })
      continue
    }

    result[key] = normalizeContentForComparison(raw)
  }

  return result
}

export function isDeepEqual(first: unknown, second: unknown): boolean {
  if (first === second) return true
  if (first === null || second === null) return false
  if (typeof first !== typeof second) return false

  if (Array.isArray(first)) {
    if (!Array.isArray(second) || first.length !== second.length) return false
    return first.every((item, index) => isDeepEqual(item, second[index]))
  }

  if (isPlainObject(first) && isPlainObject(second)) {
    const firstKeys = Object.keys(first).filter(
      (key) => first[key] !== undefined,
    )
    const secondKeys = Object.keys(second).filter(
      (key) => second[key] !== undefined,
    )
    return (
      firstKeys.length === secondKeys.length &&
      firstKeys.every((key) => isDeepEqual(first[key], second[key]))
    )
  }

  return false
}

function getOperationUrls(content: Record<string, unknown> | null): string[] {
  if (!content || !isPlainObject(content['operationSection'])) return []
  const images = content['operationSection']['images']
  if (!Array.isArray(images)) return []

  return images.flatMap((image) =>
    isPlainObject(image) && typeof image['url'] === 'string'
      ? [image['url']]
      : [],
  )
}

function buildOperationsDelta(
  content: Record<string, unknown>,
  publishedContent: Record<string, unknown> | null,
): OperationsDelta | null {
  if (
    !Object.hasOwn(content, 'operationSection') &&
    !publishedContent?.['operationSection']
  ) {
    return null
  }

  const draftUrls = getOperationUrls(content)
  const publishedUrls = getOperationUrls(publishedContent)
  const draftSet = new Set(draftUrls)
  const publishedSet = new Set(publishedUrls)
  const commonDraftOrder = draftUrls.filter((url) => publishedSet.has(url))
  const commonPublishedOrder = publishedUrls.filter((url) => draftSet.has(url))

  return {
    added: draftUrls.filter((url) => !publishedSet.has(url)).length,
    removed: publishedUrls.filter((url) => !draftSet.has(url)).length,
    reordered: commonDraftOrder.filter(
      (url, index) => commonPublishedOrder[index] !== url,
    ).length,
  }
}

function buildIndustryVideoSummary(
  content: Record<string, unknown>,
): IndustryVideoSummary | null {
  const industry = content['industrySection']
  if (!isPlainObject(industry) || !isPlainObject(industry['videos'])) {
    return null
  }

  const videos = industry['videos']
  const ownLocales: IndustryVideoSummary['ownLocales'] = ['pt-BR']
  const fallbackLocales: IndustryVideoSummary['fallbackLocales'] = []

  for (const locale of ['en', 'es'] as const) {
    const video = videos[locale]
    if (
      isPlainObject(video) &&
      typeof video['url'] === 'string' &&
      video['url'].trim()
    ) {
      ownLocales.push(locale)
    } else {
      fallbackLocales.push(locale)
    }
  }

  return { ownLocales, fallbackLocales }
}

function buildChangedSections(
  content: Record<string, unknown>,
  publishedContent: Record<string, unknown> | null,
): ChangedSection[] {
  const normalizedContent = normalizeContentForComparison(content) as Record<
    string,
    unknown
  >
  const normalizedPublished = normalizeContentForComparison(
    publishedContent ?? {},
  ) as Record<string, unknown>
  const knownKeys = new Set(SECTION_LABELS.map(([key]) => key))
  const changedKnown = SECTION_LABELS.flatMap(([key, label]) =>
    isDeepEqual(normalizedContent[key], normalizedPublished[key])
      ? []
      : [{ key, label }],
  )
  const unknownKeys = new Set([
    ...Object.keys(content),
    ...Object.keys(publishedContent ?? {}),
  ])
  const changedUnknown = [...unknownKeys]
    .filter((key) => !knownKeys.has(key))
    .filter(
      (key) =>
        !isDeepEqual(normalizedContent[key], normalizedPublished[key]),
    )
    .sort()
    .map((key) => ({ key, label: key }))

  return [...changedKnown, ...changedUnknown]
}

function buildPersistedBlockers(
  content: Record<string, unknown>,
): PublicationBlocker[] {
  if (!isPlainObject(content['operationSection'])) return []
  const images = content['operationSection']['images']
  const imageCount = Array.isArray(images) ? images.length : 0
  if (imageCount >= 6) return []

  return [
    {
      id: 'operations-minimum',
      tab: 'operacoes',
      message:
        'A seção Operações precisa ter pelo menos seis imagens antes da publicação.',
    },
  ]
}

export function buildPublicationSummary(
  content: Record<string, unknown>,
  publishedContent: Record<string, unknown> | null,
): PublicationSummary {
  return {
    changedSections: buildChangedSections(content, publishedContent),
    operations: buildOperationsDelta(content, publishedContent),
    industryVideos: buildIndustryVideoSummary(content),
    blockers: buildPersistedBlockers(content),
  }
}
