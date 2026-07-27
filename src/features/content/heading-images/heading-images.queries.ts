import { queryOptions } from '@tanstack/react-query'
import { fetchHeadingImages } from './heading-images.service'

export const headingImagesKeys = {
  all: ['heading-images'] as const,
  detail: () => [...headingImagesKeys.all, 'detail'] as const,
}

export function headingImagesQuery() {
  return queryOptions({
    queryKey: headingImagesKeys.detail(),
    queryFn: fetchHeadingImages,
  })
}
