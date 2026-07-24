export interface IndustryVideo {
  url: string
  startSeconds?: number
}

export interface IndustrySection {
  titlePrefix: string
  title: string
  subtitle: string
  videos: {
    'pt-BR': IndustryVideo
  }
}

export interface IndustrySectionResponse {
  industrySection: IndustrySection
}
