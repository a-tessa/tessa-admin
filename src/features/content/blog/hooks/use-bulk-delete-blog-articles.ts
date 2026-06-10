import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBlogArticles } from '../blog.service'
import { blogKeys } from '../blog.queries'

export function useBulkDeleteBlogArticles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slugs: string[]) => deleteBlogArticles(slugs),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
