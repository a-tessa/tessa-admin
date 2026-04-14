import { useQuery } from '@tanstack/react-query'
import { serviceDetailQuery } from '../services.queries'

export function useService(slug: string) {
  return useQuery(serviceDetailQuery(slug))
}
