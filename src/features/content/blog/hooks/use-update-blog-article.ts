import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateBlogArticle } from '../blog.service'
import { blogKeys } from '../blog.queries'
import type { BlogArticleFormInput } from '../types'

interface UpdateBlogArticleVariables {
  slug: string
  input: BlogArticleFormInput
}

export function useUpdateBlogArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, input }: UpdateBlogArticleVariables) =>
      updateBlogArticle(slug, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
