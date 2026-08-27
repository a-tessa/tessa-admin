export interface ServicePageImage {
  imgUrl: string
  alt?: string
}

export interface ServicePage {
  slug: string
  title: string
  category: string
  subtitle: string
  exampleVideoUrl: string
  backgroundImageUrl: string
  backgroundImageAlt?: string
  images: ServicePageImage[]
}

export interface ServicePageAssetMeta {
  pathname: string
  mimeType: string
  sizeBytes: number
  originalFilename: string
}

export interface ServicePageAssetUploadResponse extends ServicePageAssetMeta {
  url: string
  kind: 'background' | 'image'
  index: number | null
}

export interface ServicePageFormPayloadImage {
  imgUrl?: string
  alt?: string
  meta?: ServicePageAssetMeta
}

export interface ServicePageFormPayload {
  slug: string
  title: string
  category: string
  subtitle: string
  exampleVideoUrl: string
  backgroundImageUrl?: string
  backgroundImageAlt: string
  backgroundImageMeta?: ServicePageAssetMeta
  images: ServicePageFormPayloadImage[]
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
