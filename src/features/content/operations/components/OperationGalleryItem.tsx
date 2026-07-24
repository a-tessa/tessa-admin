import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import {
  MAX_OPERATION_ALT_LENGTH,
  MAX_OPERATION_CAPTION_LENGTH,
  OPERATION_FILE_ACCEPT,
} from '../operations.schema'
import type { OperationGalleryItem } from '../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'

interface OperationGalleryItemCardProps {
  readonly item: OperationGalleryItem
  readonly index: number
  readonly total: number
  readonly disabled: boolean
  readonly onChangeAlt: (clientId: string, alt: string) => void
  readonly onChangeCaption: (clientId: string, caption: string) => void
  readonly onMove: (clientId: string, direction: -1 | 1) => void
  readonly onRemove: (clientId: string) => void
  readonly onReplace: (clientId: string, file: File) => void
  readonly onRetry: (clientId: string) => void
}

export function OperationGalleryItemCard({
  item,
  index,
  total,
  disabled,
  onChangeAlt,
  onChangeCaption,
  onMove,
  onRemove,
  onReplace,
  onRetry,
}: OperationGalleryItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.clientId, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const altLength = item.alt.length
  const captionLength = item.caption.length
  const captionMatchesAlt =
    item.caption.trim().length > 0 && item.caption.trim() === item.alt.trim()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? 'relative z-10 rounded-xl border bg-card p-4 opacity-90 shadow-lg ring-2 ring-primary/20'
          : 'rounded-xl border bg-card p-4'
      }
      data-testid={`operation-item-${String(index)}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          className="flex shrink-0 cursor-grab items-start pt-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Arrastar imagem ${String(index + 1)}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" aria-hidden="true" />
        </button>

        <div className="relative aspect-4/3 w-full max-w-44 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {item.previewUrl ? (
            <img
              src={item.previewUrl}
              alt={item.alt || `Prévia da imagem ${String(index + 1)}`}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden="true" />
            </div>
          )}
          {item.status === 'uploading' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 text-sm">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Enviando…
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Imagem {String(index + 1)}</p>
            {item.status === 'error' ? (
              <span className="text-xs text-destructive">
                {item.errorMessage ?? 'Falha no upload.'}
              </span>
            ) : null}
            {item.status === 'ready' ? (
              <span className="text-xs text-muted-foreground">Pronto</span>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                className="text-sm font-medium"
                htmlFor={`operation-alt-${item.clientId}`}
              >
                Texto alternativo
              </label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {String(altLength)} / {String(MAX_OPERATION_ALT_LENGTH)}
              </span>
            </div>
            <Input
              id={`operation-alt-${item.clientId}`}
              value={item.alt}
              maxLength={MAX_OPERATION_ALT_LENGTH}
              disabled={disabled}
              onChange={(event): void =>
                onChangeAlt(item.clientId, event.target.value)
              }
              placeholder="Descreva a imagem objetivamente"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                className="text-sm font-medium"
                htmlFor={`operation-caption-${item.clientId}`}
              >
                Legenda (opcional)
              </label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {String(captionLength)} / {String(MAX_OPERATION_CAPTION_LENGTH)}
              </span>
            </div>
            <Textarea
              id={`operation-caption-${item.clientId}`}
              value={item.caption}
              maxLength={MAX_OPERATION_CAPTION_LENGTH}
              disabled={disabled}
              rows={2}
              onChange={(event): void =>
                onChangeCaption(item.clientId, event.target.value)
              }
              placeholder="Texto exibido na expansão"
            />
            {captionMatchesAlt ? (
              <p className="text-xs text-destructive">
                A legenda deve ser diferente do texto alternativo.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || index === 0}
              onClick={(): void => onMove(item.clientId, -1)}
              aria-label={`Mover imagem ${String(index + 1)} para cima`}
            >
              <ArrowUp className="size-4" aria-hidden="true" />
              Subir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || index >= total - 1}
              onClick={(): void => onMove(item.clientId, 1)}
              aria-label={`Mover imagem ${String(index + 1)} para baixo`}
            >
              <ArrowDown className="size-4" aria-hidden="true" />
              Descer
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept={OPERATION_FILE_ACCEPT}
                className="sr-only"
                disabled={disabled || item.status === 'uploading'}
                onChange={(event): void => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) onReplace(item.clientId, file)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || item.status === 'uploading'}
                asChild
              >
                <span>
                  <ImagePlus className="size-4" aria-hidden="true" />
                  Substituir
                </span>
              </Button>
            </label>
            {item.status === 'error' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={(): void => onRetry(item.clientId)}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Tentar novamente
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(): void => onRemove(item.clientId)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
