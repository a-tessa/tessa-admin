import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserStatus } from '../services/users.service'
import { userKeys } from '../users.queries'

interface ToggleUserStatusVariables {
  id: string
  isActive: boolean
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: ToggleUserStatusVariables) =>
      updateUserStatus(variables.id, variables.isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
