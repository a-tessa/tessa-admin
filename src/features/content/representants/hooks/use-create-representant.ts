import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRepresentant } from '../representants.service'
import { representantKeys } from '../representants.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { RepresentantInput } from '../types'

export function useCreateRepresentant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RepresentantInput) => createRepresentant(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: representantKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}
