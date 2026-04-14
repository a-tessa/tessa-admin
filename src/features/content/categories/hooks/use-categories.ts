import { useQuery } from '@tanstack/react-query'
import { categoriesListQuery } from '../categories.queries'

export function useCategories() {
  return useQuery(categoriesListQuery())
}
