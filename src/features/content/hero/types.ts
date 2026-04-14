export interface HeroTopicButton {
  text: string
  url: string
}

export interface HeroTopic {
  title: string
  description: string
  image: string
  button: HeroTopicButton
}

export type HeroSection = HeroTopic[]

export interface HeroSectionResponse {
  heroSection: HeroSection
}

export interface HeroTopicInput {
  title: string
  description: string
  image?: string | undefined
  button: HeroTopicButton
}

export type HeroSectionInput = HeroTopicInput[]

export interface HeroSectionFormData {
  payload: HeroSectionInput
  files?: Map<number, File> | undefined
  alts?: Map<number, string> | undefined
}
