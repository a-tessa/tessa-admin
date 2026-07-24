export interface OperationImageAssetMeta {
  pathname: string
  mimeType: string
  sizeBytes: number
  originalFilename: string
}

export interface OperationImage {
  url: string
  alt: string
  caption?: string
  meta?: OperationImageAssetMeta
}

export interface OperationSection {
  images: OperationImage[]
}

export interface OperationSectionResponse {
  operationSection: OperationSection
}

export interface OperationAssetUploadResponse {
  url: string
  pathname: string
  mimeType: string
  sizeBytes: number
  originalFilename: string
  index: number
}

export type OperationUploadStatus = 'uploading' | 'ready' | 'error'

export interface OperationGalleryItem {
  clientId: string
  url: string
  previewUrl: string
  alt: string
  caption: string
  status: OperationUploadStatus
  errorMessage?: string
  file?: File
  meta?: OperationImageAssetMeta
}
