export const galleryRoutePath = '/conteudo/galeria'

const galleryTabs = ['fotos', 'videos'] as const

export type GalleryTab = (typeof galleryTabs)[number]

export interface GallerySearch {
  readonly aba: GalleryTab
}

const defaultTab: GalleryTab = 'fotos'

export function isGalleryTab(value: unknown): value is GalleryTab {
  return (
    typeof value === 'string' &&
    galleryTabs.some((tab: GalleryTab) => tab === value)
  )
}

export function validateGallerySearch(
  search: Record<string, unknown>,
): GallerySearch {
  return {
    aba: isGalleryTab(search['aba']) ? search['aba'] : defaultTab,
  }
}

export function galleryTabToKind(tab: GalleryTab): 'photo' | 'video' {
  return tab === 'fotos' ? 'photo' : 'video'
}
