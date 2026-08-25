import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  applyTitleTemplate,
  SERP_DESCRIPTION_DESKTOP_PX,
  SERP_DESCRIPTION_FONT,
  SERP_DESCRIPTION_MOBILE_PX,
  SERP_TITLE_DESKTOP_PX,
  SERP_TITLE_FONT,
  SERP_TITLE_MOBILE_PX,
  truncateToWidth,
} from '../lib/text-width'
import { SEO_PAGE_PATHS, type SeoPageKey } from '../types'
import { cn } from '@/shared/lib/utils'

interface SerpPreviewProps {
  readonly pageKey: SeoPageKey
  readonly title: string
  readonly description: string
  readonly titleTemplate: string
  readonly siteName: string
}

export function SerpPreview({
  pageKey,
  title,
  description,
  titleTemplate,
  siteName,
}: SerpPreviewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const isMobile = viewport === 'mobile'
  const composed = applyTitleTemplate(
    title.trim() || 'Título da página',
    titleTemplate.trim() || '%s | Tessa',
  )
  const titleMax = isMobile ? SERP_TITLE_MOBILE_PX : SERP_TITLE_DESKTOP_PX
  const descriptionMax = isMobile
    ? SERP_DESCRIPTION_MOBILE_PX
    : SERP_DESCRIPTION_DESKTOP_PX
  const displayTitle = truncateToWidth(composed, SERP_TITLE_FONT, titleMax)
  const displayDescription = truncateToWidth(
    description.trim() || 'A descrição aparece aqui, em cinza, abaixo do título.',
    SERP_DESCRIPTION_FONT,
    descriptionMax,
  )
  const path = SEO_PAGE_PATHS[pageKey]

  return (
    <div className="space-y-3 rounded-lg border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Prévia do resultado no Google
        </p>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
            onClick={(): void => {
              setViewport('desktop')
            }}
          >
            Desktop
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
            onClick={(): void => {
              setViewport('mobile')
            }}
          >
            Celular
          </Button>
        </div>
      </div>
      <div
        className={cn('space-y-1', isMobile ? 'max-w-[22rem]' : 'max-w-[40rem]')}
      >
        <p className="truncate text-xs text-muted-foreground">
          tessa.com.br{path === '/' ? '' : path}
        </p>
        <p
          className="text-lg leading-snug text-[#1a0dab] dark:text-sky-400"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {displayTitle}
        </p>
        <p
          className="text-sm leading-snug text-[#4d5156] dark:text-muted-foreground"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {displayDescription}
        </p>
        <p className="sr-only">Marca usada na prévia: {siteName}</p>
      </div>
    </div>
  )
}
