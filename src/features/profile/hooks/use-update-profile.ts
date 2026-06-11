import { useMutation } from '@tanstack/react-query'
import { updateProfile } from '@/features/auth/api'
import type { UpdateProfileInput } from '@/features/profile/types'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
  })
}
