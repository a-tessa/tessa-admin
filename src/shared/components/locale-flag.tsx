import type { ReactElement } from 'react'
import type { ContentLocale } from '@/features/content/blog/types'

const LOCALE_LABELS: Record<ContentLocale, string> = {
  'pt-BR': 'Português',
  en: 'Inglês',
  es: 'Espanhol',
}

function BrazilFlag() {
  return (
    <svg
      viewBox="0 0 24 18"
      className="size-4 w-5 shrink-0 rounded-[2px]"
      aria-hidden
    >
      <rect width="24" height="18" fill="#009739" rx="2" />
      <path d="M12 1.5L21 9L12 16.5L3 9Z" fill="#FEDD00" />
      <circle cx="12" cy="9" r="4" fill="#002776" />
      <path
        d="M8.5 9.5Q12 7 15.5 9.5"
        stroke="white"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  )
}

function USFlag() {
  return (
    <svg
      viewBox="0 0 24 18"
      className="size-4 w-5 shrink-0 rounded-[2px]"
      aria-hidden
    >
      <rect width="24" height="18" fill="#fff" rx="2" />
      <g fill="#B22234">
        {[0, 2.77, 5.54, 8.31, 11.08, 13.85, 16.62].map((y) => (
          <rect key={y} y={y} width="24" height="1.385" />
        ))}
      </g>
      <rect width="10" height="9.69" fill="#3C3B6E" />
      <g fill="white">
        {[1.5, 4.5, 7.5].map((x) =>
          [1.2, 3.4, 5.6, 7.8].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" />
          )),
        )}
        {[3, 6].map((x) =>
          [2.3, 4.5, 6.7].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" />
          )),
        )}
      </g>
    </svg>
  )
}

function SpainFlag() {
  return (
    <svg
      viewBox="0 0 24 18"
      className="size-4 w-5 shrink-0 rounded-[2px]"
      aria-hidden
    >
      <rect width="24" height="18" fill="#AA151B" rx="2" />
      <rect y="4.5" width="24" height="9" fill="#F1BF00" />
    </svg>
  )
}

const LOCALE_FLAGS: Record<ContentLocale, () => ReactElement> = {
  'pt-BR': BrazilFlag,
  en: USFlag,
  es: SpainFlag,
}

interface LocaleFlagProps {
  locale: ContentLocale
  className?: string
}

export function LocaleFlag({ locale, className }: LocaleFlagProps) {
  const Flag = LOCALE_FLAGS[locale]
  return (
    <span
      className={className}
      title={LOCALE_LABELS[locale]}
      aria-label={LOCALE_LABELS[locale]}
    >
      <Flag />
    </span>
  )
}

interface LocaleFlagsProps {
  locales: ContentLocale[]
  className?: string
}

export function LocaleFlags({ locales, className }: LocaleFlagsProps) {
  if (locales.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      {locales.map((locale) => (
        <LocaleFlag key={locale} locale={locale} />
      ))}
    </div>
  )
}
