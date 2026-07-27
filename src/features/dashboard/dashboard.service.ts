import { authenticatedRequest } from '@/shared/lib/api'
import type { DashboardStatsResponse } from './types'

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  return authenticatedRequest<DashboardStatsResponse>(
    '/api/dashboard/admin/stats',
  )
}
