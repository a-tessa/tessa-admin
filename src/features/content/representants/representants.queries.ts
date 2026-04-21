import { queryOptions } from '@tanstack/react-query'
import {
  fetchRepresentant,
  fetchRepresentantSegments,
  fetchRepresentants,
} from './representants.service'

export const representantKeys = {
  all: ['content', 'representants'] as const,
  lists: () => [...representantKeys.all, 'list'] as const,
  list: () => [...representantKeys.lists()] as const,
  details: () => [...representantKeys.all, 'detail'] as const,
  detail: (id: string) => [...representantKeys.details(), id] as const,
  segments: () => [...representantKeys.all, 'segments'] as const,
}

export function representantsListQuery() {
  return queryOptions({
    queryKey: representantKeys.list(),
    queryFn: fetchRepresentants,
  })
}

export function representantDetailQuery(id: string) {
  return queryOptions({
    queryKey: representantKeys.detail(id),
    queryFn: () => fetchRepresentant(id),
    enabled: id !== '',
  })
}

export function representantSegmentsQuery() {
  return queryOptions({
    queryKey: representantKeys.segments(),
    queryFn: fetchRepresentantSegments,
  })
}
