import { describe, expect, it } from 'vitest'
import {
  isNavigationGroupActive,
  navigationItems,
  type NavigationItem,
} from './navigation'

function group(label: string): NavigationItem {
  const item = navigationItems.find((entry) => entry.label === label)
  if (!item) throw new Error(`missing group ${label}`)
  return item
}

describe('isNavigationGroupActive', () => {
  it('abre Conteúdos nas páginas de conteúdo e não no SEO', () => {
    const contents = group('Conteúdos')
    expect(isNavigationGroupActive(contents, '/conteudo')).toBe(true)
    expect(isNavigationGroupActive(contents, '/conteudo/blog')).toBe(true)
    expect(isNavigationGroupActive(contents, '/conteudo/blog/artigo')).toBe(
      true,
    )
    expect(isNavigationGroupActive(contents, '/conteudo/seo')).toBe(false)
    expect(
      isNavigationGroupActive(contents, '/conteudo/redirecionamentos'),
    ).toBe(false)
  })

  it('abre SEO e URLs só nas telas de busca e redirecionamento', () => {
    const seo = group('SEO e URLs')
    expect(isNavigationGroupActive(seo, '/conteudo/seo')).toBe(true)
    expect(isNavigationGroupActive(seo, '/conteudo/redirecionamentos')).toBe(
      true,
    )
    expect(isNavigationGroupActive(seo, '/conteudo/blog')).toBe(false)
    expect(isNavigationGroupActive(seo, '/conteudo')).toBe(false)
  })
})
