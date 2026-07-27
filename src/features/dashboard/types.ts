export interface DashboardStats {
  pendingContacts: number
  totalContacts: number
  pendingTestimonials: number
  approvedTestimonials: number
  averageRating: number | null
  publishedArticles: number
  draftArticles: number
  documents: number
  galleryItems: number
  activeUsers: number
  instagramConnected: boolean
}

export interface DashboardStatsResponse {
  stats: DashboardStats
}
