import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { redirectKeys, redirectsQuery } from '../redirects.queries'
import {
  createRedirect,
  deleteRedirect,
  updateRedirect,
} from '../redirects.service'
import type { RedirectInput, RedirectListParams } from '../types'

export function useRedirects(params: RedirectListParams) {
  return useQuery(redirectsQuery(params))
}

function useInvalidateRedirects(): () => Promise<void> {
  const queryClient = useQueryClient()
  return async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: redirectKeys.all })
  }
}

export function useCreateRedirect() {
  const invalidate = useInvalidateRedirects()
  return useMutation({
    mutationFn: createRedirect,
    onSuccess: invalidate,
  })
}

export function useUpdateRedirect() {
  const invalidate = useInvalidateRedirects()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RedirectInput }) =>
      updateRedirect(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteRedirect() {
  const invalidate = useInvalidateRedirects()
  return useMutation({
    mutationFn: deleteRedirect,
    onSuccess: invalidate,
  })
}
