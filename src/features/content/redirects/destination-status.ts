import type { RedirectRecord } from './types'

export function slugFromPrefixedPath(
  path: string,
  prefix: '/blog/' | '/servicos/',
): string | null {
  if (!path.startsWith(prefix)) return null
  const slug = path.slice(prefix.length)
  if (!slug || slug.includes('/')) return null
  return slug
}

/**
 * Automatic redirects stay after the blog article or CMS service page is
 * deleted. Ticket 07: the admin must show that the destination now 404s.
 */
export function isSlugChangeDestinationMissing(
  record: Pick<RedirectRecord, 'source' | 'toPath' | 'entityType'>,
  live: {
    blogSlugs: ReadonlySet<string>
    serviceSlugs: ReadonlySet<string>
  },
): boolean {
  if (record.source !== 'slugChange') return false
  if (/^https?:\/\//i.test(record.toPath)) return false

  if (record.entityType === 'blogArticle') {
    const slug = slugFromPrefixedPath(record.toPath, '/blog/')
    return slug === null || !live.blogSlugs.has(slug)
  }

  if (record.entityType === 'servicePage') {
    const slug = slugFromPrefixedPath(record.toPath, '/servicos/')
    return slug === null || !live.serviceSlugs.has(slug)
  }

  return false
}
