import { z } from 'zod'
import type { AboutSection, AboutVideo } from './types'

export const MAX_ABOUT_HERO_TITLE_LENGTH = 80
export const MAX_ABOUT_BODY_LENGTH = 4000
export const MAX_ABOUT_SIDE_IMAGE_ALT_LENGTH = 120
export const MAX_ABOUT_PILLAR_TITLE_LENGTH = 80
export const MAX_ABOUT_PILLAR_DESCRIPTION_LENGTH = 500

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
    (url: string): boolean =>
      url.length === 0 || getYouTubeVideoId(url) !== null,
    'Informe uma URL válida do YouTube.',
  )

const pillarFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório.')
    .max(
      MAX_ABOUT_PILLAR_TITLE_LENGTH,
      `O título deve ter no máximo ${String(MAX_ABOUT_PILLAR_TITLE_LENGTH)} caracteres.`,
    ),
  description: z
    .string()
    .trim()
    .min(1, 'A descrição é obrigatória.')
    .max(
      MAX_ABOUT_PILLAR_DESCRIPTION_LENGTH,
      `A descrição deve ter no máximo ${String(MAX_ABOUT_PILLAR_DESCRIPTION_LENGTH)} caracteres.`,
    ),
})

export const aboutSectionFormSchema = z
  .object({
    heroTitle: z
      .string()
      .trim()
      .min(1, 'O título do vídeo é obrigatório.')
      .max(
        MAX_ABOUT_HERO_TITLE_LENGTH,
        `O título deve ter no máximo ${String(MAX_ABOUT_HERO_TITLE_LENGTH)} caracteres.`,
      ),
    body: z
      .string()
      .trim()
      .min(1, 'O texto lateral é obrigatório.')
      .max(
        MAX_ABOUT_BODY_LENGTH,
        `O texto deve ter no máximo ${String(MAX_ABOUT_BODY_LENGTH)} caracteres.`,
      ),
    sideImageUrl: z.string().trim().min(1, 'Envie a foto lateral.'),
    sideImageAlt: z
      .string()
      .trim()
      .min(1, 'O texto alternativo da foto é obrigatório.')
      .max(
        MAX_ABOUT_SIDE_IMAGE_ALT_LENGTH,
        `O texto alternativo deve ter no máximo ${String(MAX_ABOUT_SIDE_IMAGE_ALT_LENGTH)} caracteres.`,
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
    mission: pillarFormSchema,
    vision: pillarFormSchema,
    values: pillarFormSchema,
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

export type AboutSectionFormValues = z.infer<typeof aboutSectionFormSchema>

export const defaultAboutSectionFormValues: AboutSectionFormValues = {
  heroTitle: '',
  body: '',
  sideImageUrl: '',
  sideImageAlt: '',
  videoUrl: '',
  startSeconds: '',
  videoUrlEn: '',
  startSecondsEn: '',
  videoUrlEs: '',
  startSecondsEs: '',
  mission: { title: '', description: '' },
  vision: { title: '', description: '' },
  values: { title: '', description: '' },
}

function toFormVideoFields(video: AboutVideo | undefined): {
  url: string
  startSeconds: string
} {
  if (!video) return { url: '', startSeconds: '' }

  return {
    url: video.url,
    startSeconds:
      video.startSeconds === undefined ? '' : String(video.startSeconds),
  }
}

export function toAboutSectionFormValues(
  section: AboutSection | null,
): AboutSectionFormValues {
  if (!section) return defaultAboutSectionFormValues

  const portuguese = toFormVideoFields(section.videos['pt-BR'])
  const english = toFormVideoFields(section.videos.en)
  const spanish = toFormVideoFields(section.videos.es)

  return {
    heroTitle: section.heroTitle,
    body: section.body,
    sideImageUrl: section.sideImage.url,
    sideImageAlt: section.sideImage.alt,
    videoUrl: portuguese.url,
    startSeconds: portuguese.startSeconds,
    videoUrlEn: english.url,
    startSecondsEn: english.startSeconds,
    videoUrlEs: spanish.url,
    startSecondsEs: spanish.startSeconds,
    mission: section.mission,
    vision: section.vision,
    values: section.values,
  }
}

function toVideoInput(url: string, startSecondsRaw: string): AboutVideo {
  const startSeconds: number | undefined =
    startSecondsRaw.length === 0
      ? undefined
      : Number.parseInt(startSecondsRaw, 10)

  return startSeconds === undefined ? { url } : { url, startSeconds }
}

function toOptionalVideoInput(
  url: string,
  startSecondsRaw: string,
): AboutVideo | undefined {
  return url.length === 0 ? undefined : toVideoInput(url, startSecondsRaw)
}

export function toAboutSectionInput(
  values: AboutSectionFormValues,
): AboutSection {
  const portugueseVideo = toVideoInput(values.videoUrl, values.startSeconds)
  const englishVideo = toOptionalVideoInput(
    values.videoUrlEn,
    values.startSecondsEn,
  )
  const spanishVideo = toOptionalVideoInput(
    values.videoUrlEs,
    values.startSecondsEs,
  )

  return {
    heroTitle: values.heroTitle,
    body: values.body,
    sideImage: {
      url: values.sideImageUrl,
      alt: values.sideImageAlt,
    },
    videos: {
      'pt-BR': portugueseVideo,
      ...(englishVideo ? { en: englishVideo } : {}),
      ...(spanishVideo ? { es: spanishVideo } : {}),
    },
    mission: values.mission,
    vision: values.vision,
    values: values.values,
  }
}
