export interface ServicePageImage {
  imgUrl: string
}

export interface ServicePage {
  slug: string
  title: string
  category: string
  subtitle: string
  exampleVideoUrl: string
  backgroundImageUrl: string
  images: ServicePageImage[]
}

export interface ServicePageFormPayload {
  slug: string
  title: string
  category: string
  subtitle: string
  exampleVideoUrl: string
  backgroundImageUrl?: string
  images: Array<{ imgUrl?: string }>
}

export interface ServicePageFormData {
  payload: ServicePageFormPayload
  backgroundImage?: File
  galleryFiles?: Map<number, File>
}

export interface ServicePagesResponse {
  servicesPages: ServicePage[]
}

export interface ServicePageItemResponse {
  item: ServicePage
}
