import { Check, Loader2, Star, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDeleteTestimonial } from '../hooks/use-delete-testimonial'
import { useModerateTestimonial } from '../hooks/use-moderate-testimonial'
import type { AdminTestimonial } from '../types'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

interface TestimonialReviewDialogProps {
  testimonial: AdminTestimonial | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<
  AdminTestimonial['status'],
  { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }
> = {
  pending: {
    label: 'Pendente',
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-200',
  },
  approved: {
    label: 'Aprovado',
    variant: 'default',
    className: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  rejected: {
    label: 'Rejeitado',
    variant: 'outline',
    className: 'border-destructive/50 text-destructive',
  },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Avaliação ${String(rating)} de 5 estrelas`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'size-4',
            index < rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/40',
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1.5 text-sm font-medium text-muted-foreground">
        {String(rating)}/5
      </span>
    </div>
  )
}

export function TestimonialReviewDialog({
  testimonial,
  open,
  onOpenChange,
}: TestimonialReviewDialogProps) {
  const moderateMutation = useModerateTestimonial()
  const deleteMutation = useDeleteTestimonial()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!testimonial) return null

  const statusBadge = statusConfig[testimonial.status]
  const isPending = moderateMutation.isPending || deleteMutation.isPending
  const canApprove = testimonial.status !== 'approved'
  const canReject = testimonial.status !== 'rejected'

  function handleModerate(status: 'approved' | 'rejected') {
    if (!testimonial) return

    moderateMutation.mutate(
      { id: testimonial.id, input: { status } },
      {
        onSuccess: () => {
          toast.success(
            status === 'approved'
              ? 'Depoimento aprovado e publicado.'
              : 'Depoimento rejeitado.',
          )
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  function handleDelete() {
    if (!testimonial) return

    deleteMutation.mutate(testimonial.id, {
      onSuccess: () => {
        toast.success('Depoimento removido.')
        setConfirmDelete(false)
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error.message)
        setConfirmDelete(false)
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <DialogTitle>Moderar depoimento</DialogTitle>
                <DialogDescription>
                  Revise o conteúdo antes de aprovar ou rejeitar a publicação na
                  landing.
                </DialogDescription>
              </div>
              <Badge
                variant={statusBadge.variant}
                className={cn('shrink-0', statusBadge.className)}
              >
                {statusBadge.label}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <Avatar size="lg">
                {testimonial.profileImageUrl ? (
                  <AvatarImage
                    src={testimonial.profileImageUrl}
                    alt={testimonial.authorName}
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(testimonial.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{testimonial.authorName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {[testimonial.authorRole, testimonial.companyName]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
              </div>
              <StarRating rating={testimonial.rating} />
            </div>

            {testimonial.question ? (
              <div className="rounded-md border-l-2 border-primary/50 bg-primary/5 px-3 py-2 text-sm text-muted-foreground italic">
                “{testimonial.question}”
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Comentário
              </p>
              <p className="whitespace-pre-wrap rounded-md border bg-card px-3 py-2.5 text-sm leading-relaxed">
                {testimonial.comment}
              </p>
            </div>

            {testimonial.reviewImageUrl ? (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Foto da avaliação
                </p>
                <div className="overflow-hidden rounded-md border bg-muted">
                  <img
                    src={testimonial.reviewImageUrl}
                    alt={`Avaliação enviada por ${testimonial.authorName}`}
                    className="max-h-80 w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : null}

            <Separator />

            <dl className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Enviado em</dt>
                <dd>{formatDateTime(testimonial.createdAt)}</dd>
              </div>
              {testimonial.reviewedAt ? (
                <div>
                  <dt className="font-medium text-foreground">Moderado em</dt>
                  <dd>{formatDateTime(testimonial.reviewedAt)}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              disabled={isPending}
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Remover
            </Button>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModerate('rejected')}
                disabled={isPending || !canReject}
                className="gap-2"
              >
                {moderateMutation.isPending &&
                moderateMutation.variables.input.status === 'rejected' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <X className="size-4" />
                )}
                Rejeitar
              </Button>
              <Button
                type="button"
                onClick={() => handleModerate('approved')}
                disabled={isPending || !canApprove}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90"
              >
                {moderateMutation.isPending &&
                moderateMutation.variables.input.status === 'approved' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Aprovar e publicar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(value) => {
          if (!deleteMutation.isPending) setConfirmDelete(value)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover depoimento?</AlertDialogTitle>
            <AlertDialogDescription>
              O depoimento de <strong>{testimonial.authorName}</strong> será
              excluído permanentemente junto com suas imagens. Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
