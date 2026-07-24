export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'

export type InstagramSelectionSlot = 'primary' | 'upperRight' | 'lowerRight'

export interface InstagramMediaDto {
  id: string
  instagramMediaId: string
  mediaType: InstagramMediaType
  caption: string | null
  altText: string | null
  permalink: string
  imageUrl: string
  isCollaborative: boolean
  isAvailable: boolean
  isLocalized?: boolean
  unavailableAt: string | null
  publishedAt: string
  syncedAt: string
}

export interface InstagramSelectionDto {
  version: number
  primary: string
  upperRight: string
  lowerRight: string
}

export interface InstagramConnectionDto {
  id: string
  username: string
  facebookPageId: string
  facebookPageName: string
  accountType: string | null
  tokenExpiresAt: string
  lastSyncedAt: string | null
  lastSyncError: string | null
  scopes: string[]
  createdAt: string
  updatedAt: string
}

export interface InstagramStatusResponse {
  configured: boolean
  enabled: boolean
  connected: boolean
  connection: InstagramConnectionDto | null
  media: InstagramMediaDto[]
}

export interface InstagramCatalogResponse {
  updatedAt: string
  draftSelection: InstagramSelectionDto | null
  publishedSelection: InstagramSelectionDto | null
  media: InstagramMediaDto[]
}

export interface SaveInstagramSelectionInput {
  expectedUpdatedAt: string
  primary: string
  upperRight: string
  lowerRight: string
}

export interface InstagramOAuthStartResponse {
  authorizeUrl: string
}

export interface InstagramSyncResponse {
  ok: boolean
  synced: number
  unavailable: number
  connectionId: string
  username: string
}
