export type ArticleHrefKind = 'internal' | 'external' | 'contact'

/**
 * Classifies a stored article href without requiring a new HTML attribute.
 * Existing blog markup only has `href`; kind is inferred from that string.
 */
export function classifyArticleHref(href: string): ArticleHrefKind {
  const value = href.trim()

  if (/^(mailto|tel):/i.test(value)) {
    return 'contact'
  }

  if (value.startsWith('//')) {
    return 'external'
  }

  if (value.startsWith('#') || value.startsWith('?') || value.startsWith('/')) {
    return 'internal'
  }

  try {
    const url = new URL(value)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return 'external'
    }
  } catch {
    /* fall through */
  }

  return 'internal'
}

/**
 * Light cleanup for newly authored hrefs. Does not rewrite stored HTML;
 * call this only when the editor applies a link.
 */
export function normalizeArticleHref(href: string): string {
  const value = href.trim()
  if (value.length === 0) {
    return value
  }

  if (/^(mailto|tel):/i.test(value)) {
    return value
  }

  if (value.startsWith('#') || value.startsWith('?')) {
    return value
  }

  if (value.startsWith('//')) {
    return `https:${value}`
  }

  if (value.startsWith('/')) {
    return value
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}([/:?#].*)?$/i.test(value)) {
    return `https://${value}`
  }

  return `/${value.replace(/^\/+/, '')}`
}

export function isOffsiteArticleHref(href: string): boolean {
  return classifyArticleHref(href) === 'external'
}

export function articleLinkMarkAttrs(href: string): {
  href: string
  target?: string
  rel?: string
} {
  const normalized = normalizeArticleHref(href)

  if (isOffsiteArticleHref(normalized)) {
    return {
      href: normalized,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  return { href: normalized }
}
