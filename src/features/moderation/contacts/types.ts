import type { PaginationMeta, PaginationParams } from '@/features/users/types'

export interface AdminContact {
  id: string
  fullName: string
  email: string
  phone: string
  companyName: string
  city: string
  state: string
  service: string | null
  message: string | null
  hasBeenContacted: boolean
  createdAt: string
}

export interface ContactStats {
  totalContacts: number
  respondedContacts: number
}

export type ContactListParams = PaginationParams

export interface ContactListResponse {
  contacts: AdminContact[]
  pagination: PaginationMeta
}

export interface ContactItemResponse {
  contact: AdminContact
}

export interface ContactStatsResponse {
  stats: ContactStats
}

export interface UpdateContactStatusInput {
  hasBeenContacted: boolean
}
