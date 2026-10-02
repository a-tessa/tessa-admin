import type { PaginationMeta, PaginationParams } from '@/features/users/types'

export interface AdminTalentApplication {
  id: string
  fullName: string
  email: string
  phone: string
  educationLevel: string
  education: string
  practiceArea: string
  professionalSummary: string
  createdAt: string
}

export type TalentApplicationListParams = PaginationParams

export interface TalentApplicationListResponse {
  talentApplications: AdminTalentApplication[]
  pagination: PaginationMeta
}
