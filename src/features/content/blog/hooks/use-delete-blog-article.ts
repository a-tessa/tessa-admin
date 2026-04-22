import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBlogArticle } from '../blog.service'
import { blogKeys } from '../blog.queries'

export function useDeleteBlogArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => deleteBlogArticle(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
