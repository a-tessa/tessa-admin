import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { BlogArticleStatus } from '../types'

interface BlogArticleStatusBadgeProps {
  status: BlogArticleStatus
  className?: string
}

const labels: Record<BlogArticleStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
}

export function BlogArticleStatusBadge({
  status,
  className,
}: BlogArticleStatusBadgeProps) {
  return (
    <Badge
      variant={status === 'published' ? 'default' : 'secondary'}
      className={cn(
        'font-normal',
        status === 'draft' && 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {labels[status]}
    </Badge>
  )
}
