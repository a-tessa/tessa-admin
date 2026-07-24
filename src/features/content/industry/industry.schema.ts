import { z } from 'zod'
import type { IndustrySection } from './types'

export const MAX_INDUSTRY_TITLE_PREFIX_LENGTH = 60
export const MAX_INDUSTRY_TITLE_LENGTH = 100
export const MAX_INDUSTRY_SUBTITLE_LENGTH = 300

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/
const NON_NEGATIVE_INTEGER_REGEX = /^\d+$/

export function getYouTubeVideoId(
  input: string | null | undefined,
): string | null {
  if (!input) return null

  const value: string = input.trim()
  if (!value) return null
  if (YOUTUBE_ID_REGEX.test(value)) return value

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  const host: string = url.hostname.replace(/^www\./, '')
  const isYouTubeHost: boolean =
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com' ||
    host === 'youtu.be'

  if (!isYouTubeHost) return null

  if (host === 'youtu.be') {
    const id: string = url.pathname.replace(/^\//, '').split('/')[0] ?? ''
    return YOUTUBE_ID_REGEX.test(id) ? id : null
  }

  const queryId: string | null = url.searchParams.get('v')
  if (queryId && YOUTUBE_ID_REGEX.test(queryId)) return queryId

  const pathSegments: string[] = url.pathname.split('/').filter(Boolean)
  const videoSegmentIndex: number = pathSegments.findIndex(
    (segment: string): boolean =>
      segment === 'embed' ||
      segment === 'shorts' ||
      segment === 'v' ||
      segment === 'live',
  )
  const pathId: string | undefined = pathSegments[videoSegmentIndex + 1]

  return videoSegmentIndex >= 0 &&
    pathId !== undefined &&
    YOUTUBE_ID_REGEX.test(pathId)
    ? pathId
    : null
}

export const industrySectionFormSchema = z.object({
  titlePrefix: z
    .string()
    .trim()
    .min(1, 'O prefixo do título é obrigatório.')
    .max(
      MAX_INDUSTRY_TITLE_PREFIX_LENGTH,
      'O prefixo deve ter no máximo 60 caracteres.',
    ),
  title: z
    .string()
    .trim()
    .min(1, 'O título principal é obrigatório.')
    .max(
      MAX_INDUSTRY_TITLE_LENGTH,
      'O título deve ter no máximo 100 caracteres.',
    ),
  subtitle: z
    .string()
    .trim()
    .min(1, 'O subtítulo é obrigatório.')
    .max(
      MAX_INDUSTRY_SUBTITLE_LENGTH,
      'O subtítulo deve ter no máximo 300 caracteres.',
    ),
  videoUrl: z
    .string()
    .trim()
    .min(1, 'A URL do vídeo em português é obrigatória.')
    .refine(
      (url: string): boolean => getYouTubeVideoId(url) !== null,
      'Informe uma URL válida do YouTube.',
    ),
  startSeconds: z
    .string()
    .trim()
    .refine(
      (value: string): boolean =>
        value.length === 0 || NON_NEGATIVE_INTEGER_REGEX.test(value),
      'O segundo inicial deve ser um número inteiro maior ou igual a zero.',
    ),
})

export type IndustrySectionFormValues = z.infer<
  typeof industrySectionFormSchema
>

export const defaultIndustrySectionFormValues: IndustrySectionFormValues = {
  titlePrefix: '',
  title: '',
  subtitle: '',
  videoUrl: '',
  startSeconds: '',
}

export function toIndustrySectionFormValues(
  section: IndustrySection | null,
): IndustrySectionFormValues {
  if (!section) return defaultIndustrySectionFormValues

  return {
    titlePrefix: section.titlePrefix,
    title: section.title,
    subtitle: section.subtitle,
    videoUrl: section.videos['pt-BR'].url,
    startSeconds:
      section.videos['pt-BR'].startSeconds === undefined
        ? ''
        : String(section.videos['pt-BR'].startSeconds),
  }
}

export function toIndustrySectionInput(
  values: IndustrySectionFormValues,
): IndustrySection {
  const startSeconds: number | undefined =
    values.startSeconds.length === 0
      ? undefined
      : Number.parseInt(values.startSeconds, 10)

  return {
    titlePrefix: values.titlePrefix,
    title: values.title,
    subtitle: values.subtitle,
    videos: {
      'pt-BR': {
        url: values.videoUrl,
        ...(startSeconds === undefined ? {} : { startSeconds }),
      },
    },
  }
}
