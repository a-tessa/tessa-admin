import type { PaginationMeta, PaginationParams } from '@/features/users/types'

export type TestimonialStatus = 'pending' | 'approved' | 'rejected'

export type TestimonialSource = 'submitted' | 'google'

export interface AdminTestimonial {
  id: string
  authorName: string
  authorRole: string | null
  companyName: string | null
  rating: number
  comment: string
  question: string | null
  profileImageUrl: string | null
  profileImagePathname: string | null
  reviewImageUrl: string | null
  reviewImagePathname: string | null
  status: TestimonialStatus
  source: TestimonialSource
  authorUrl: string | null
  hidden: boolean
  createdAt: string
  reviewedAt: string | null
  reviewedById: string | null
}

export interface TestimonialStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface TestimonialListParams extends PaginationParams {
  status?: TestimonialStatus | undefined
}

export interface TestimonialsListResponse {
  testimonials: AdminTestimonial[]
  pagination: PaginationMeta
}

export interface TestimonialItemResponse {
  testimonial: AdminTestimonial
}

export interface TestimonialStatsResponse {
  stats: TestimonialStats
}

export interface ModerateTestimonialInput {
  status: Extract<TestimonialStatus, 'approved' | 'rejected'>
}

export interface SetTestimonialVisibilityInput {
  hidden: boolean
}
