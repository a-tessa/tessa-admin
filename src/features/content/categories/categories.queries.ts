import { queryOptions } from '@tanstack/react-query'
import { fetchCategories, fetchCategory } from './categories.service'

export const categoryKeys = {
  all: ['content', 'categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

export function categoriesListQuery() {
  return queryOptions({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
  })
}

export function categoryDetailQuery(id: string) {
  return queryOptions({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: id !== '',
  })
}
