import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTestimonial } from '../testimonials.service'
import { testimonialKeys } from '../testimonials.queries'

export function useDeleteTestimonial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
    },
  })
}
