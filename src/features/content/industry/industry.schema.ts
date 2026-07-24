import { z } from 'zod'
import type { IndustryLocale, IndustrySection, IndustryVideo } from './types'

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

/** A YouTube URL paired with its start second, both as raw form-input strings. */
export interface VideoFormFields {
  url: string
  startSeconds: string
}

const startSecondsFieldSchema = z
  .string()
  .trim()
  .refine(
    (value: string): boolean =>
      value.length === 0 || NON_NEGATIVE_INTEGER_REGEX.test(value),
    'O segundo inicial deve ser um número inteiro maior ou igual a zero.',
  )

const optionalYouTubeUrlFieldSchema = z
  .string()
  .trim()
  .refine(
    (url: string): boolean => url.length === 0 || getYouTubeVideoId(url) !== null,
    'Informe uma URL válida do YouTube.',
  )

export const industrySectionFormSchema = z
  .object({
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
    startSeconds: startSecondsFieldSchema,
    videoUrlEn: optionalYouTubeUrlFieldSchema,
    startSecondsEn: startSecondsFieldSchema,
    videoUrlEs: optionalYouTubeUrlFieldSchema,
    startSecondsEs: startSecondsFieldSchema,
  })
  .superRefine((values, ctx): void => {
    const optionalVideoLocales = [
      { urlKey: 'videoUrlEn', secondsKey: 'startSecondsEn', label: 'inglês' },
      { urlKey: 'videoUrlEs', secondsKey: 'startSecondsEs', label: 'espanhol' },
    ] as const

    for (const { urlKey, secondsKey, label } of optionalVideoLocales) {
      if (values[urlKey].length === 0 && values[secondsKey].length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `Informe a URL do vídeo em ${label} para usar o segundo inicial.`,
          path: [secondsKey],
        })
      }
    }
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
  videoUrlEn: '',
  startSecondsEn: '',
  videoUrlEs: '',
  startSecondsEs: '',
}

function toFormVideoFields(video: IndustryVideo | undefined): VideoFormFields {
  if (!video) return { url: '', startSeconds: '' }

  return {
    url: video.url,
    startSeconds: video.startSeconds === undefined ? '' : String(video.startSeconds),
  }
}

export function toIndustrySectionFormValues(
  section: IndustrySection | null,
): IndustrySectionFormValues {
  if (!section) return defaultIndustrySectionFormValues

  const portuguese = toFormVideoFields(section.videos['pt-BR'])
  const english = toFormVideoFields(section.videos.en)
  const spanish = toFormVideoFields(section.videos.es)

  return {
    titlePrefix: section.titlePrefix,
    title: section.title,
    subtitle: section.subtitle,
    videoUrl: portuguese.url,
    startSeconds: portuguese.startSeconds,
    videoUrlEn: english.url,
    startSecondsEn: english.startSeconds,
    videoUrlEs: spanish.url,
    startSecondsEs: spanish.startSeconds,
  }
}

function toVideoInput(url: string, startSecondsRaw: string): IndustryVideo {
  const startSeconds: number | undefined =
    startSecondsRaw.length === 0 ? undefined : Number.parseInt(startSecondsRaw, 10)

  return startSeconds === undefined ? { url } : { url, startSeconds }
}

function toOptionalVideoInput(
  url: string,
  startSecondsRaw: string,
): IndustryVideo | undefined {
  return url.length === 0 ? undefined : toVideoInput(url, startSecondsRaw)
}

export function toIndustrySectionInput(
  values: IndustrySectionFormValues,
): IndustrySection {
  // `videoUrl` is required by the schema, so the Portuguese video is always defined.
  const portugueseVideo = toVideoInput(values.videoUrl, values.startSeconds)
  const englishVideo = toOptionalVideoInput(values.videoUrlEn, values.startSecondsEn)
  const spanishVideo = toOptionalVideoInput(values.videoUrlEs, values.startSecondsEs)

  return {
    titlePrefix: values.titlePrefix,
    title: values.title,
    subtitle: values.subtitle,
    videos: {
      'pt-BR': portugueseVideo,
      ...(englishVideo ? { en: englishVideo } : {}),
      ...(spanishVideo ? { es: spanishVideo } : {}),
    },
  }
}

export interface PreviewVideo {
  videoUrl: string
  startSeconds: string
  isFallback: boolean
}

export function resolvePreviewVideo(
  locale: IndustryLocale,
  portuguese: VideoFormFields,
  localized: VideoFormFields | undefined,
): PreviewVideo {
  if (locale !== 'pt-BR' && localized && getYouTubeVideoId(localized.url) !== null) {
    return { videoUrl: localized.url, startSeconds: localized.startSeconds, isFallback: false }
  }

  return {
    videoUrl: portuguese.url,
    startSeconds: portuguese.startSeconds,
    isFallback: locale !== 'pt-BR',
  }
}
