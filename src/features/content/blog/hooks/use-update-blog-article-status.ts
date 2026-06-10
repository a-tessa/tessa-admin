import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateBlogArticleStatus } from '../blog.service'
import { blogKeys } from '../blog.queries'
import type { BlogArticleStatus } from '../types'

interface UpdateBlogArticleStatusVariables {
  slug: string
  status: BlogArticleStatus
}

export function useUpdateBlogArticleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, status }: UpdateBlogArticleStatusVariables) =>
      updateBlogArticleStatus(slug, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
