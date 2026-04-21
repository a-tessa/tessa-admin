import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRepresentant } from '../representants.service'
import { representantKeys } from '../representants.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { RepresentantInput } from '../types'

interface UpdateRepresentantVariables {
  id: string
  input: RepresentantInput
}

export function useUpdateRepresentant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateRepresentantVariables) =>
      updateRepresentant(variables.id, variables.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: representantKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}
