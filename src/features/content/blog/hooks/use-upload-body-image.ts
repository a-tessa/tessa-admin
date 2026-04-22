import { useMutation } from '@tanstack/react-query'
import { uploadBlogBodyImage } from '../blog.service'

export function useUploadBodyImage() {
  return useMutation({
    mutationFn: (file: File) => uploadBlogBodyImage(file),
  })
}
