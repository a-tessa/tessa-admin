import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRepresentant } from '../representants.service'
import { representantKeys } from '../representants.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'

export function useDeleteRepresentant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRepresentant(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: representantKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}
