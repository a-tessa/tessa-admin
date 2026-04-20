export { useTestimonials } from './hooks/use-testimonials'
export { useTestimonialStats } from './hooks/use-testimonial-stats'
export { useModerateTestimonial } from './hooks/use-moderate-testimonial'
export { useDeleteTestimonial } from './hooks/use-delete-testimonial'

export {
  testimonialKeys,
  testimonialsListQuery,
  testimonialStatsQuery,
  testimonialDetailQuery,
} from './testimonials.queries'

export type {
  AdminTestimonial,
  TestimonialStats,
  TestimonialStatus,
  TestimonialListParams,
  TestimonialsListResponse,
  TestimonialItemResponse,
  TestimonialStatsResponse,
  ModerateTestimonialInput,
} from './types'
