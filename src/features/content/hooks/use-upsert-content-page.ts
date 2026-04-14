import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upsertContentPage } from '../services/content.service'
import { contentKeys } from '../content.queries'
import type { UpsertContentPageInput } from '../types'

interface UpsertContentPageVariables {
  slug: string
  input: UpsertContentPageInput
}

export function useUpsertContentPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpsertContentPageVariables) =>
      upsertContentPage(variables.slug, variables.input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: contentKeys.detail(variables.slug),
      })
    },
  })
}
