import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { createUser } from '../services/users.service'
import type { CreateUserInput } from '../types'

export function useCreateUser() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken ?? ''

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input, accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
