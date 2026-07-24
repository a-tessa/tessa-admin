export interface IndustryVideo {
  url: string
  startSeconds?: number
}

export type IndustryLocale = 'pt-BR' | 'en' | 'es'

export interface IndustrySection {
  titlePrefix: string
  title: string
  subtitle: string
  videos: {
    'pt-BR': IndustryVideo
    en?: IndustryVideo
    es?: IndustryVideo
  }
}

export interface IndustrySectionResponse {
  industrySection: IndustrySection
}
