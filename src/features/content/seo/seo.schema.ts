import { z } from 'zod'
import { env } from '@/shared/config/env'
import {
  SEO_PAGE_KEYS,
  type PageSeo,
  type PageSeoEntry,
  type SeoDefaults,
  type SeoPageKey,
} from './types'

export const MAX_SEO_META_TITLE_LENGTH = 70
export const MAX_SEO_META_DESCRIPTION_LENGTH = 180
export const MAX_SEO_FOCUS_KEYWORD_LENGTH = 60
export const MAX_SEO_SITE_NAME_LENGTH = 80
export const MAX_SEO_TITLE_TEMPLATE_LENGTH = 40
export const MAX_SEO_KEYWORDS = 15
export const MAX_SEO_VERIFICATION_LENGTH = 120
export const MAX_SEO_SOCIAL_TITLE_LENGTH = 90
export const MAX_SEO_SOCIAL_DESCRIPTION_LENGTH = 200
export const RECOMMENDED_SOCIAL_TITLE_MAX = 60
export const RECOMMENDED_SOCIAL_DESCRIPTION_MAX = 120

export const SEO_ROBOTS_OPTIONS = [
  'index, follow',
  'noindex, follow',
  'index, nofollow',
  'noindex, nofollow',
] as const

export type SeoRobotsOption = (typeof SEO_ROBOTS_OPTIONS)[number]

const CANONICAL_LOCALE_PREFIXES = new Set(['en', 'es', 'pt-br'])

export function robotsFromBooleans(
  noIndex: boolean,
  noFollow: boolean,
): SeoRobotsOption {
  if (noIndex && noFollow) return 'noindex, nofollow'
  if (noIndex) return 'noindex, follow'
  if (noFollow) return 'index, nofollow'
  return 'index, follow'
}

export function booleansFromRobots(robots: SeoRobotsOption): {
  noIndex: boolean
  noFollow: boolean
} {
  return {
    noIndex: robots.startsWith('noindex'),
    noFollow: robots.endsWith('nofollow'),
  }
}

function stripLocalePrefix(pathname: string): string {
  let path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const match = path.match(/^\/(en|es|pt-br)(?=\/|$)/i)
  if (match) {
    const rest = path.slice(match[0].length)
    path = rest.length === 0 ? '/' : rest
  }
  path = path.toLowerCase()
  return path.length === 0 ? '/' : path
}

function normalizeRelativeCanonicalPath(path: string): string {
  let normalized = path.toLowerCase()
  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/, '')
  }
  return normalized.length === 0 ? '/' : normalized
}

export function normalizeCanonicalInput(
  value: string,
  siteOrigin: string,
): { canonicalUrl: string; convertedFromOwnHost: boolean } {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return { canonicalUrl: '', convertedFromOwnHost: false }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      const origin = new URL(siteOrigin)
      if (
        url.hostname.toLowerCase() === origin.hostname.toLowerCase()
      ) {
        return {
          canonicalUrl: stripLocalePrefix(url.pathname),
          convertedFromOwnHost: true,
        }
      }
    } catch {
      return { canonicalUrl: trimmed, convertedFromOwnHost: false }
    }

    return { canonicalUrl: trimmed, convertedFromOwnHost: false }
  }

  return {
    canonicalUrl: normalizeRelativeCanonicalPath(trimmed),
    convertedFromOwnHost: false,
  }
}

function isValidCanonicalInput(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0) return true
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return false
  if (/[?#]/.test(trimmed)) return false
  const firstSegment = normalizeRelativeCanonicalPath(trimmed)
    .split('/')
    .filter(Boolean)[0]
  if (firstSegment && CANONICAL_LOCALE_PREFIXES.has(firstSegment)) return false
  return true
}

export const defaultSeoDefaultsFormValues = {
  siteName: 'Tessa Tecnologia e Desenvolvimento LTDA',
  titleTemplate: '%s | Tessa',
  defaultMetaDescription:
    'Aço galvanizado. Engenharia aplicada. Produção industrial. Entrega para o seu projeto sair do papel com previsibilidade.',
  keywordsText:
    'Estrutura metálica para telhado, Carport, Estruturas de aviário, Aço galvanizado, Engenharia aplicada, Produção industrial',
  googleSiteVerification: '',
  bingSiteVerification: '',
  twitterSite: '',
  allowIndexing: true,
  defaultOgImageUrl: '',
}

export const seoDefaultsFormSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, 'O nome do site é obrigatório.')
    .max(
      MAX_SEO_SITE_NAME_LENGTH,
      `O nome do site deve ter no máximo ${String(MAX_SEO_SITE_NAME_LENGTH)} caracteres.`,
    ),
  titleTemplate: z
    .string()
    .trim()
    .min(1, 'O modelo de título é obrigatório.')
    .max(
      MAX_SEO_TITLE_TEMPLATE_LENGTH,
      `O modelo de título deve ter no máximo ${String(MAX_SEO_TITLE_TEMPLATE_LENGTH)} caracteres.`,
    )
    .refine(
      (value: string): boolean => value.includes('%s'),
      'O modelo de título precisa conter %s no lugar do título da página.',
    ),
  defaultMetaDescription: z
    .string()
    .trim()
    .min(1, 'A descrição padrão é obrigatória.')
    .max(
      MAX_SEO_META_DESCRIPTION_LENGTH,
      `A descrição padrão deve ter no máximo ${String(MAX_SEO_META_DESCRIPTION_LENGTH)} caracteres.`,
    ),
  keywordsText: z.string(),
  googleSiteVerification: z
    .string()
    .trim()
    .max(
      MAX_SEO_VERIFICATION_LENGTH,
      `O código do Google deve ter no máximo ${String(MAX_SEO_VERIFICATION_LENGTH)} caracteres.`,
    ),
  bingSiteVerification: z
    .string()
    .trim()
    .max(
      MAX_SEO_VERIFICATION_LENGTH,
      `O código do Bing deve ter no máximo ${String(MAX_SEO_VERIFICATION_LENGTH)} caracteres.`,
    ),
  twitterSite: z
    .string()
    .trim()
    .refine(
      (value: string): boolean =>
        value.length === 0 || /^@[A-Za-z0-9_]{1,15}$/.test(value),
      'Informe o handle no formato @perfil, com até 15 caracteres.',
    ),
  allowIndexing: z.boolean(),
  defaultOgImageUrl: z.string(),
})

export type SeoDefaultsFormValues = z.infer<typeof seoDefaultsFormSchema>

const changeFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly'])

export const pageSeoEntryFormSchema = z.object({
  metaTitle: z
    .string()
    .max(
      MAX_SEO_META_TITLE_LENGTH,
      `O título deve ter no máximo ${String(MAX_SEO_META_TITLE_LENGTH)} caracteres.`,
    ),
  metaDescription: z
    .string()
    .max(
      MAX_SEO_META_DESCRIPTION_LENGTH,
      `A descrição deve ter no máximo ${String(MAX_SEO_META_DESCRIPTION_LENGTH)} caracteres.`,
    ),
  focusKeyword: z
    .string()
    .max(
      MAX_SEO_FOCUS_KEYWORD_LENGTH,
      `O termo principal deve ter no máximo ${String(MAX_SEO_FOCUS_KEYWORD_LENGTH)} caracteres.`,
    ),
  ogImageUrl: z.string(),
  socialTitle: z
    .string()
    .max(
      MAX_SEO_SOCIAL_TITLE_LENGTH,
      `O título social deve ter no máximo ${String(MAX_SEO_SOCIAL_TITLE_LENGTH)} caracteres.`,
    ),
  socialDescription: z
    .string()
    .max(
      MAX_SEO_SOCIAL_DESCRIPTION_LENGTH,
      `A descrição social deve ter no máximo ${String(MAX_SEO_SOCIAL_DESCRIPTION_LENGTH)} caracteres.`,
    ),
  canonicalUrl: z.string().refine(
    (value: string): boolean => isValidCanonicalInput(value),
    'Informe um caminho interno começando por / (sem idioma, query ou âncora) ou uma URL http(s).',
  ),
  robots: z.enum(SEO_ROBOTS_OPTIONS),
  changeFrequency: z.union([z.literal(''), changeFrequencySchema]),
  priority: z.string(),
})

export const pageSeoFormSchema = z
  .object({
    pages: z.object(
      Object.fromEntries(
        SEO_PAGE_KEYS.map((pageKey) => [pageKey, pageSeoEntryFormSchema]),
      ) as Record<SeoPageKey, typeof pageSeoEntryFormSchema>,
    ),
  })
  .superRefine((values, context) => {
    for (const pageKey of SEO_PAGE_KEYS) {
      const entry = values.pages[pageKey]
      const hasTitle = entry.metaTitle.trim().length > 0
      const hasDescription = entry.metaDescription.trim().length > 0
      if (hasTitle === hasDescription) continue

      if (!hasTitle) {
        context.addIssue({
          code: 'custom',
          path: ['pages', pageKey, 'metaTitle'],
          message: 'Informe o título desta página ou limpe também a descrição.',
        })
      }
      if (!hasDescription) {
        context.addIssue({
          code: 'custom',
          path: ['pages', pageKey, 'metaDescription'],
          message: 'Informe a descrição desta página ou limpe também o título.',
        })
      }
    }
  })

export type PageSeoFormValues = z.infer<typeof pageSeoFormSchema>
export type PageSeoEntryFormValues = z.infer<typeof pageSeoEntryFormSchema>

function emptyPageEntry(pageKey: SeoPageKey): PageSeoEntryFormValues {
  return {
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    ogImageUrl: '',
    socialTitle: '',
    socialDescription: '',
    canonicalUrl: '',
    robots: pageKey === 'nao-encontrada' ? 'noindex, follow' : 'index, follow',
    changeFrequency: pageKey === 'home' ? 'weekly' : pageKey === 'blog' ? 'daily' : '',
    priority: pageKey === 'home' ? '1' : '',
  }
}

export const defaultPageSeoFormValues: PageSeoFormValues = {
  pages: Object.fromEntries(
    SEO_PAGE_KEYS.map((pageKey) => [pageKey, emptyPageEntry(pageKey)]),
  ) as PageSeoFormValues['pages'],
}

export function parseKeywordsText(value: string): string[] {
  const keywords = value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)

  return [...new Set(keywords)].slice(0, MAX_SEO_KEYWORDS)
}

export function toSeoDefaultsFormValues(
  section: SeoDefaults | null,
): SeoDefaultsFormValues {
  if (!section) return defaultSeoDefaultsFormValues

  return {
    siteName: section.siteName,
    titleTemplate: section.titleTemplate,
    defaultMetaDescription: section.defaultMetaDescription,
    keywordsText: section.keywords.join(', '),
    googleSiteVerification: section.googleSiteVerification ?? '',
    bingSiteVerification: section.bingSiteVerification ?? '',
    twitterSite: section.twitterSite ?? '',
    allowIndexing: section.allowIndexing,
    defaultOgImageUrl: section.defaultOgImageUrl ?? '',
  }
}

export function toSeoDefaultsInput(
  values: SeoDefaultsFormValues,
): SeoDefaults {
  const keywords = parseKeywordsText(values.keywordsText)
  const googleSiteVerification = values.googleSiteVerification.trim()
  const bingSiteVerification = values.bingSiteVerification.trim()
  const twitterSite = values.twitterSite.trim()
  const defaultOgImageUrl = values.defaultOgImageUrl.trim()

  return {
    siteName: values.siteName.trim(),
    titleTemplate: values.titleTemplate.trim(),
    defaultMetaDescription: values.defaultMetaDescription.trim(),
    keywords,
    allowIndexing: values.allowIndexing,
    ...(defaultOgImageUrl ? { defaultOgImageUrl } : {}),
    ...(googleSiteVerification ? { googleSiteVerification } : {}),
    ...(bingSiteVerification ? { bingSiteVerification } : {}),
    ...(twitterSite ? { twitterSite } : {}),
  }
}

export function toPageSeoFormValues(pageSeo: PageSeo | null): PageSeoFormValues {
  const pages = { ...defaultPageSeoFormValues.pages }

  if (!pageSeo) return { pages }

  for (const pageKey of SEO_PAGE_KEYS) {
    const entry = pageSeo[pageKey]
    if (!entry) continue
    pages[pageKey] = {
      metaTitle: entry.metaTitle,
      metaDescription: entry.metaDescription,
      focusKeyword: entry.focusKeyword ?? '',
      ogImageUrl: entry.ogImageUrl ?? '',
      socialTitle: entry.socialTitle ?? '',
      socialDescription: entry.socialDescription ?? '',
      canonicalUrl: entry.canonicalUrl ?? '',
      robots: robotsFromBooleans(entry.noIndex, Boolean(entry.noFollow)),
      changeFrequency: entry.changeFrequency ?? '',
      priority:
        typeof entry.priority === 'number' ? String(entry.priority) : '',
    }
  }

  return { pages }
}

function parsePriority(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) return undefined
  return parsed
}

export function toPageSeoInput(
  values: PageSeoFormValues,
  siteOrigin: string = env.publicSiteUrl,
): PageSeo {
  const pageSeo: PageSeo = {}

  for (const pageKey of SEO_PAGE_KEYS) {
    const entry = values.pages[pageKey]
    const metaTitle = entry.metaTitle.trim()
    const metaDescription = entry.metaDescription.trim()
    if (metaTitle.length === 0 && metaDescription.length === 0) continue

    const focusKeyword = entry.focusKeyword.trim()
    const ogImageUrl = entry.ogImageUrl.trim()
    const socialTitle = entry.socialTitle.trim()
    const socialDescription = entry.socialDescription.trim()
    const { canonicalUrl } = normalizeCanonicalInput(
      entry.canonicalUrl,
      siteOrigin,
    )
    const { noIndex, noFollow } = booleansFromRobots(entry.robots)
    const next: PageSeoEntry = {
      metaTitle,
      metaDescription,
      noIndex,
      noFollow,
    }

    if (focusKeyword.length > 0) next.focusKeyword = focusKeyword
    if (ogImageUrl.length > 0) next.ogImageUrl = ogImageUrl
    if (socialTitle.length > 0) next.socialTitle = socialTitle
    if (socialDescription.length > 0) next.socialDescription = socialDescription
    if (canonicalUrl.length > 0) next.canonicalUrl = canonicalUrl
    if (entry.changeFrequency !== '') {
      next.changeFrequency = entry.changeFrequency
    }
    const priority = parsePriority(entry.priority)
    if (priority !== undefined) next.priority = priority

    pageSeo[pageKey] = next
  }

  return pageSeo
}
