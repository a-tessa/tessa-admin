import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  emptyToNull,
  MAX_GALLERY_PHOTOS,
  MAX_GALLERY_VIDEOS,
  type GalleryPhotoFormValues,
  type GalleryVideoFormValues,
} from '../gallery.schema'
import {
  useCreateGalleryPhoto,
  useCreateGalleryVideo,
  useDeleteGalleryMediaItem,
  useReorderGalleryMediaItems,
  useReplaceGalleryPhoto,
  useUpdateGalleryMediaItem,
} from '../hooks/use-gallery-mutations'
import { useGalleryItems } from '../hooks/use-gallery-items'
import type { GalleryMediaItemAdmin, GalleryMediaKind } from '../types'
import { GalleryItemCard } from './GalleryItemCard'
import { GalleryItemFormDialog } from './GalleryItemFormDialog'

interface GalleryKindPanelProps {
  readonly kind: GalleryMediaKind
}

export function GalleryKindPanel({ kind }: GalleryKindPanelProps) {
  const itemsQuery = useGalleryItems(kind)
  const createPhotoMutation = useCreateGalleryPhoto()
  const createVideoMutation = useCreateGalleryVideo()
  const updateMutation = useUpdateGalleryMediaItem()
  const replacePhotoMutation = useReplaceGalleryPhoto()
  const reorderMutation = useReorderGalleryMediaItems()
  const deleteMutation = useDeleteGalleryMediaItem()

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryMediaItemAdmin | undefined>()
  const [deletingItem, setDeletingItem] = useState<GalleryMediaItemAdmin | null>(null)

  const items = itemsQuery.data?.items ?? []
  const limit = kind === 'photo' ? MAX_GALLERY_PHOTOS : MAX_GALLERY_VIDEOS
  const atLimit = items.length >= limit
  const isMutating =
    createPhotoMutation.isPending ||
    createVideoMutation.isPending ||
    updateMutation.isPending ||
    replacePhotoMutation.isPending ||
    reorderMutation.isPending ||
    deleteMutation.isPending

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  function openCreate() {
    setEditingItem(undefined)
    setFormOpen(true)
  }

  function openEdit(item: GalleryMediaItemAdmin) {
    setEditingItem(item)
    setFormOpen(true)
  }

  function persistOrder(orderedIds: string[]) {
    reorderMutation.mutate(
      { kind, orderedIds },
      {
        onSuccess: () => toast.success('Ordem atualizada.'),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    persistOrder(reordered.map((item) => item.id))
  }

  function handleMove(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return
    const reordered = arrayMove(items, index, nextIndex)
    persistOrder(reordered.map((item) => item.id))
  }

  function handleSubmitPhoto(params: {
    file: File | null
    values: GalleryPhotoFormValues
  }) {
    if (editingItem) {
      const runUpdate = () =>
        updateMutation.mutate(
          {
            id: editingItem.id,
            kind: 'photo',
            input: {
              alt: params.values.alt,
              caption: emptyToNull(params.values.caption),
              categorySlug: emptyToNull(params.values.categorySlug),
            },
          },
          {
            onSuccess: () => {
              toast.success('Foto atualizada.')
              setFormOpen(false)
            },
            onError: (error) => toast.error(error.message),
          },
        )

      if (params.file) {
        replacePhotoMutation.mutate(
          { id: editingItem.id, file: params.file },
          {
            onSuccess: () => runUpdate(),
            onError: (error) => toast.error(error.message),
          },
        )
        return
      }

      runUpdate()
      return
    }

    if (!params.file) {
      toast.error('Selecione uma imagem.')
      return
    }

    createPhotoMutation.mutate(
      {
        file: params.file,
        alt: params.values.alt,
        caption: emptyToNull(params.values.caption),
        categorySlug: emptyToNull(params.values.categorySlug),
      },
      {
        onSuccess: () => {
          toast.success('Foto adicionada.')
          setFormOpen(false)
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  function handleSubmitVideo(values: GalleryVideoFormValues) {
    if (editingItem) {
      updateMutation.mutate(
        {
          id: editingItem.id,
          kind: 'video',
          input: {
            youtubeUrl: values.youtubeUrl,
            alt: values.alt,
            caption: emptyToNull(values.caption),
            categorySlug: emptyToNull(values.categorySlug),
          },
        },
        {
          onSuccess: () => {
            toast.success('Vídeo atualizado.')
            setFormOpen(false)
          },
          onError: (error) => toast.error(error.message),
        },
      )
      return
    }

    createVideoMutation.mutate(
      {
        youtubeUrl: values.youtubeUrl,
        alt: values.alt,
        caption: emptyToNull(values.caption),
        categorySlug: emptyToNull(values.categorySlug),
      },
      {
        onSuccess: () => {
          toast.success('Vídeo adicionado.')
          setFormOpen(false)
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  if (itemsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (itemsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Não foi possível carregar a Galeria</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-3">
          <span>{itemsQuery.error.message}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void itemsQuery.refetch()}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle>{kind === 'photo' ? 'Fotos' : 'Vídeos'}</CardTitle>
            <CardDescription>
              {String(items.length)} de {String(limit)}{' '}
              {kind === 'photo' ? 'fotos' : 'vídeos'}. Salvar publica na landing.
            </CardDescription>
          </div>
          <Button type="button" onClick={openCreate} disabled={atLimit || isMutating}>
            {isMutating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {atLimit ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Limite atingido</AlertTitle>
              <AlertDescription>
                Remova um item para adicionar outro.
              </AlertDescription>
            </Alert>
          ) : null}

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhum item ainda. Adicione o primeiro para começar o acervo.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <GalleryItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      total={items.length}
                      disabled={isMutating}
                      onMove={handleMove}
                      onEdit={openEdit}
                      onDelete={setDeletingItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <GalleryItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        kind={kind}
        item={editingItem}
        isPending={isMutating}
        onSubmitPhoto={handleSubmitPhoto}
        onSubmitVideo={handleSubmitVideo}
      />

      <AlertDialog
        open={deletingItem !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item da Galeria?</AlertDialogTitle>
            <AlertDialogDescription>
              O item sai do site imediatamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || !deletingItem}
              onClick={() => {
                if (!deletingItem) return
                deleteMutation.mutate(
                  { id: deletingItem.id, kind },
                  {
                    onSuccess: () => {
                      toast.success('Item removido.')
                      setDeletingItem(null)
                    },
                    onError: (error) => toast.error(error.message),
                  },
                )
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
