import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { GalleryMediaItemAdmin } from '../types'

interface GalleryItemCardProps {
  readonly item: GalleryMediaItemAdmin
  readonly index: number
  readonly total: number
  readonly disabled: boolean
  readonly onMove: (id: string, direction: -1 | 1) => void
  readonly onEdit: (item: GalleryMediaItemAdmin) => void
  readonly onDelete: (item: GalleryMediaItemAdmin) => void
}

export function GalleryItemCard({
  item,
  index,
  total,
  disabled,
  onMove,
  onEdit,
  onDelete,
}: GalleryItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const previewUrl =
    item.kind === 'photo'
      ? item.imageUrl
      : item.youtubeVideoId
        ? `https://i.ytimg.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
        : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? 'relative z-10 rounded-xl border bg-card p-4 opacity-90 shadow-lg ring-2 ring-primary/20'
          : 'rounded-xl border bg-card p-4'
      }
      data-testid={`gallery-item-${String(index)}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          className="flex shrink-0 cursor-grab items-start pt-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Arrastar item ${String(index + 1)}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" aria-hidden="true" />
        </button>

        <div className="relative aspect-4/3 w-full max-w-44 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={item.alt}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium">{item.alt}</p>
          {item.caption ? (
            <p className="text-sm text-muted-foreground">{item.caption}</p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Sem legenda</p>
          )}
          <p className="text-xs text-muted-foreground">
            {item.categorySlug ? `Categoria: ${item.categorySlug}` : 'Sem categoria'}
          </p>
          {item.kind === 'video' && item.youtubeUrl ? (
            <p className="truncate text-xs text-muted-foreground">{item.youtubeUrl}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || index === 0}
              onClick={() => onMove(item.id, -1)}
              aria-label={`Mover item ${String(index + 1)} para cima`}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || index >= total - 1}
              onClick={() => onMove(item.id, 1)}
              aria-label={`Mover item ${String(index + 1)} para baixo`}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onEdit(item)}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={disabled}
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
