function isCategoryRecord(
  value: unknown,
): value is { slug: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof value.slug === 'string'
  )
}

export function isUnpublishedCategorySlug(
  categorySlug: string,
  publishedContent: Record<string, unknown> | null | undefined,
): boolean {
  const slug = categorySlug.trim()
  if (!slug) return false

  const categories = publishedContent?.['categories']
  if (!Array.isArray(categories)) return true

  return !categories.some(
    (category) => isCategoryRecord(category) && category.slug === slug,
  )
}
