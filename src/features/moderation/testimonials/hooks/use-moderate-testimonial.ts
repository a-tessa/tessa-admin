import { useMutation, useQueryClient } from '@tanstack/react-query'
import { moderateTestimonial } from '../testimonials.service'
import { testimonialKeys } from '../testimonials.queries'
import type { ModerateTestimonialInput } from '../types'

interface ModerateTestimonialVariables {
  id: string
  input: ModerateTestimonialInput
}

export function useModerateTestimonial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: ModerateTestimonialVariables) =>
      moderateTestimonial(variables.id, variables.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
    },
  })
}
