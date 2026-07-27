export const HEADING_IMAGE_PAGE_KEYS = [
  'quem-somos',
  'servicos',
  'representantes',
  'blog',
  'downloads',
  'galeria',
  'contato',
] as const

export type HeadingImagePageKey = (typeof HEADING_IMAGE_PAGE_KEYS)[number]

export const HEADING_IMAGE_PAGE_LABELS = {
  'quem-somos': 'Quem Somos',
  servicos: 'Serviços',
  representantes: 'Representantes',
  blog: 'Blog',
  downloads: 'Downloads',
  galeria: 'Galeria',
  contato: 'Contato',
} as const satisfies Record<HeadingImagePageKey, string>

export interface HeadingImageEntry {
  url: string
}

export type HeadingImages = Partial<Record<HeadingImagePageKey, HeadingImageEntry>>

export interface HeadingImagesResponse {
  headingImages: HeadingImages
}
