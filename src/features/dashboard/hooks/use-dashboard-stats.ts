import { useQuery } from '@tanstack/react-query'
import { dashboardStatsQuery } from '../dashboard.queries'

export function useDashboardStats() {
  return useQuery(dashboardStatsQuery())
}
