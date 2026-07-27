import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setTestimonialVisibility } from '../testimonials.service'
import { testimonialKeys } from '../testimonials.queries'
import type { SetTestimonialVisibilityInput } from '../types'

interface SetVisibilityVariables {
  id: string
  input: SetTestimonialVisibilityInput
}

export function useSetTestimonialVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: SetVisibilityVariables) =>
      setTestimonialVisibility(variables.id, variables.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
    },
  })
}
