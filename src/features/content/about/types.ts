export interface AboutVideo {
  url: string
  startSeconds?: number
}

export type AboutLocale = 'pt-BR' | 'en' | 'es'

export interface AboutPillar {
  title: string
  description: string
}

export interface AboutSideImage {
  url: string
  alt: string
}

export interface AboutSection {
  heroTitle: string
  videos: {
    'pt-BR': AboutVideo
    en?: AboutVideo
    es?: AboutVideo
  }
  sideImage: AboutSideImage
  body: string
  mission: AboutPillar
  vision: AboutPillar
  values: AboutPillar
}

export interface AboutSectionResponse {
  aboutSection: AboutSection
}

export interface AboutAssetUploadResponse {
  url: string
  pathname: string
  mimeType: string
  sizeBytes: number
  originalFilename: string
}
