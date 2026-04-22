import { queryOptions } from '@tanstack/react-query'
import {
  fetchContact,
  fetchContactStats,
  fetchContacts,
} from './contacts.service'
import type { ContactListParams } from './types'

export const contactKeys = {
  all: ['moderation', 'contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params: ContactListParams) =>
    [...contactKeys.lists(), params] as const,
  stats: () => [...contactKeys.all, 'stats'] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
}

export function contactsListQuery(params: ContactListParams) {
  return queryOptions({
    queryKey: contactKeys.list(params),
    queryFn: () => fetchContacts(params),
  })
}

export function contactStatsQuery() {
  return queryOptions({
    queryKey: contactKeys.stats(),
    queryFn: fetchContactStats,
  })
}

export function contactDetailQuery(id: string) {
  return queryOptions({
    queryKey: contactKeys.detail(id),
    queryFn: () => fetchContact(id),
    enabled: id !== '',
  })
}
