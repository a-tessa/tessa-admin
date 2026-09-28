import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminContent } from '@/features/content/publish/hooks/use-admin-content'
import { usePublishMainContent } from '@/features/content/publish/hooks/use-publish-main-content'
import { Button } from '@/shared/components/ui/button'
import { isUnpublishedCategorySlug } from '../unpublished-category'

interface UnpublishedCategoryNoticeProps {
  categorySlug: string
}

export function UnpublishedCategoryNotice({
  categorySlug,
}: UnpublishedCategoryNoticeProps) {
  const { data, isPending } = useAdminContent()
  const publishMutation = usePublishMainContent()

  const showNotice =
    !isPending &&
    isUnpublishedCategorySlug(categorySlug, data?.publishedContent)

  if (!showNotice) return null

  function handlePublish(): void {
    publishMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Conteúdo publicado com sucesso.')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="space-y-2" role="status">
      <p className="text-sm text-amber-900 dark:text-amber-100">
        Essa categoria está em rascunho, publique primeiro as alterações de
        nova categoria criada
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handlePublish}
        disabled={publishMutation.isPending}
      >
        {publishMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : null}
        Publicar
      </Button>
    </div>
  )
}
