import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { updateUserStatus } from '../services/users.service'

interface ToggleUserStatusVariables {
  id: string
  isActive: boolean
}

export function useToggleUserStatus() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken ?? ''

  return useMutation({
    mutationFn: (variables: ToggleUserStatusVariables) =>
      updateUserStatus(variables.id, variables.isActive, accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
