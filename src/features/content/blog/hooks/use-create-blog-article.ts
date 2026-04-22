import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBlogArticle } from '../blog.service'
import { blogKeys } from '../blog.queries'
import type { BlogArticleFormInput } from '../types'

export function useCreateBlogArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BlogArticleFormInput) => createBlogArticle(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
