import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { upsertContentPage } from '../services/content.service'
import type { UpsertContentPageInput } from '../types'

interface UpsertContentPageVariables {
  slug: string
  input: UpsertContentPageInput
}

export function useUpsertContentPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken ?? ''

  return useMutation({
    mutationFn: (variables: UpsertContentPageVariables) =>
      upsertContentPage(variables.slug, variables.input, accessToken),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['content-pages'] })
      void queryClient.invalidateQueries({
        queryKey: ['content-page', variables.slug],
      })
    },
  })
}
