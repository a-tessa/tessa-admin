import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTalentApplication } from '../talent-applications.service'
import { talentApplicationKeys } from '../talent-applications.queries'

export function useDeleteTalentApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTalentApplication(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentApplicationKeys.all })
    },
  })
}
