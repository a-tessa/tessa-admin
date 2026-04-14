import { Loader2, Rocket } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useHasUnpublishedChanges } from '../hooks/use-has-unpublished-changes'
import { usePublishMainContent } from '../hooks/use-publish-main-content'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { formatRelativeDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

export function PublishFloatingBar() {
  const { hasChanges, isLoading, publishedAt, updatedAt } = useHasUnpublishedChanges()
  const publishMutation = usePublishMainContent()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handlePublish() {
    publishMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Conteúdo publicado com sucesso.')
        setConfirmOpen(false)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  if (isLoading || !hasChanges) return null

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex items-center justify-between',
          'border-t bg-card/95 px-4 py-2.5 shadow-[0_-2px_12px_0_oklch(0_0_0/0.06)] backdrop-blur-sm',
          'lg:left-64',
          'animate-in slide-in-from-bottom-full duration-300 fill-mode-both',
        )}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
          </span>

          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-foreground">
              Alterações não publicadas
            </p>
            {updatedAt ? (
              <p className="text-[0.625rem] text-muted-foreground">
                Editado {formatRelativeDate(updatedAt)}
                {publishedAt
                  ? ` · Publicado ${formatRelativeDate(publishedAt)}`
                  : ' · Nunca publicado'}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          size="default"
          className="gap-1.5"
          onClick={() => setConfirmOpen(true)}
          disabled={publishMutation.isPending}
        >
          {publishMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Rocket className="size-3.5" />
          )}
          Publicar
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar conteúdo?</AlertDialogTitle>
            <AlertDialogDescription>
              O rascunho atual de toda a landing page será promovido para a versão
              publicada e ficará visível ao público imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : null}
              Publicar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
