import { describe, expect, it } from 'vitest'
import {
  articleLinkMarkAttrs,
  classifyArticleHref,
  normalizeArticleHref,
} from './article-href'

describe('classifyArticleHref', () => {
  it('treats root-relative paths as internal and http(s) as external', () => {
    expect(classifyArticleHref('/contato')).toBe('internal')
    expect(classifyArticleHref('/blog/meu-artigo')).toBe('internal')
    expect(classifyArticleHref('https://exemplo.com/doc')).toBe('external')
    expect(classifyArticleHref('//cdn.exemplo.com/a')).toBe('external')
  })
})

describe('normalizeArticleHref', () => {
  it('does not rewrite already-valid hrefs used in existing articles', () => {
    expect(normalizeArticleHref('/contato')).toBe('/contato')
    expect(normalizeArticleHref('https://exemplo.com')).toBe(
      'https://exemplo.com',
    )
  })

  it('fills in https for bare domains and a slash for internal paths', () => {
    expect(normalizeArticleHref('exemplo.com/doc')).toBe(
      'https://exemplo.com/doc',
    )
    expect(normalizeArticleHref('contato')).toBe('/contato')
  })
})

describe('articleLinkMarkAttrs', () => {
  it('opens offsite links in a new tab and keeps internal links in place', () => {
    expect(articleLinkMarkAttrs('/contato')).toEqual({ href: '/contato' })
    expect(articleLinkMarkAttrs('https://exemplo.com')).toEqual({
      href: 'https://exemplo.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })
})
