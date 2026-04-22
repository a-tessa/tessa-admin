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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Image, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useHeroSection } from '../hooks/use-hero-section'
import { useCreateHeroSection } from '../hooks/use-create-hero-section'
import { useUpdateHeroSection } from '../hooks/use-update-hero-section'
import { useDeleteHeroSection } from '../hooks/use-delete-hero-section'
import {
  HeroTopicEditDialog,
  type HeroTopicEditResult,
} from '../components/HeroTopicEditDialog'
import type { HeroSectionFormData, HeroTopic, HeroTopicInput } from '../types'
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
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

const MAX_TOPICS = 3

function SortableHeroTopicCard({
  id,
  topic,
  index,
  onEdit,
  onRemove,
  canRemove,
  disabled,
}: {
  id: string
  topic: HeroTopic
  index: number
  onEdit: () => void
  onRemove: () => void
  canRemove: boolean
  disabled: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'relative z-10 opacity-90' : 'relative'}
    >
      <Card className={isDragging ? 'shadow-lg ring-2 ring-primary/20' : undefined}>
        <CardContent className="flex gap-4 p-4">
          <button
            type="button"
            className="flex shrink-0 cursor-grab items-center self-stretch text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>

          <div className="relative size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
            {topic.image ? (
              <img
                src={topic.image}
                alt={topic.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Image className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="shrink-0 text-xs">
                Tópico {String(index + 1)}
              </Badge>
            </div>
            <p className="truncate text-lg font-medium">{topic.title}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {topic.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Botão: {topic.button.text} → {topic.button.url}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-1">
            <Button variant="secondary" className="size-10" onClick={onEdit}>
              <Pencil className="size-4" />
            </Button>
            {canRemove ? (
              <Button
                variant="ghost"
                className="size-10"
                onClick={onRemove}
                disabled={disabled}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function buildFormData(
  topics: HeroTopicInput[],
  files: Map<number, File>,
): HeroSectionFormData {
  return {
    payload: topics,
    files: files.size > 0 ? files : undefined,
  }
}

export function HeroSectionPage() {
  const heroQuery = useHeroSection()
  const createMutation = useCreateHeroSection()
  const updateMutation = useUpdateHeroSection()
  const deleteMutation = useDeleteHeroSection()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const heroSection = heroQuery.data?.heroSection
  const hasHero = heroSection && heroSection.length > 0
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const editingTopic =
    editingIndex !== null && heroSection
      ? heroSection[editingIndex]
      : undefined

  const sortableIds = heroSection
    ? heroSection.map((_, i) => `hero-topic-${String(i)}`)
    : []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function openCreate() {
    setEditingIndex(null)
    setDialogOpen(true)
  }

  function openEdit(index: number) {
    setEditingIndex(index)
    setDialogOpen(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !heroSection) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove([...heroSection], oldIndex, newIndex)
    const reorderedInputs: HeroTopicInput[] = reordered.map((t) => ({ ...t }))

    updateMutation.mutate(buildFormData(reorderedInputs, new Map()), {
      onSuccess: () => toast.success('Ordem atualizada.'),
      onError: (error) => toast.error(error.message),
    })
  }

  function handleTopicSubmit(result: HeroTopicEditResult) {
    const topicInput: HeroTopicInput = {
      title: result.title,
      description: result.description,
      button: result.button,
      image: result.image,
    }

    const files = new Map<number, File>()

    if (editingIndex !== null && hasHero) {
      const updatedTopics: HeroTopicInput[] = heroSection.map((t, i) =>
        i === editingIndex ? topicInput : { ...t },
      )
      if (result.file) {
        files.set(editingIndex, result.file)
      }
      updateMutation.mutate(buildFormData(updatedTopics, files), {
        onSuccess: () => {
          toast.success('Tópico atualizado.')
          setDialogOpen(false)
        },
        onError: (error) => toast.error(error.message),
      })
    } else if (hasHero) {
      const newIndex = heroSection.length
      const updatedTopics: HeroTopicInput[] = [
        ...heroSection.map((t) => ({ ...t })),
        topicInput,
      ]
      if (result.file) {
        files.set(newIndex, result.file)
      }
      updateMutation.mutate(buildFormData(updatedTopics, files), {
        onSuccess: () => {
          toast.success('Tópico adicionado.')
          setDialogOpen(false)
        },
        onError: (error) => toast.error(error.message),
      })
    } else {
      if (result.file) {
        files.set(0, result.file)
      }
      createMutation.mutate(buildFormData([topicInput], files), {
        onSuccess: () => {
          toast.success('Seção hero criada.')
          setDialogOpen(false)
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  function handleDelete() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Seção hero removida.')
        setDeleteOpen(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  function handleRemoveTopic(index: number) {
    if (!heroSection) return

    if (heroSection.length <= 1) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => toast.success('Seção hero removida.'),
        onError: (error) => toast.error(error.message),
      })
      return
    }

    const updatedTopics: HeroTopicInput[] = heroSection
      .filter((_, i) => i !== index)
      .map((t) => ({ ...t }))

    updateMutation.mutate(buildFormData(updatedTopics, new Map()), {
      onSuccess: () => toast.success('Tópico removido.'),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Seção Principal
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os tópicos do banner principal da landing page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasHero && heroSection.length < MAX_TOPICS ? (
            <Button
              size="sm"
              className="gap-2"
              onClick={openCreate}
              disabled={isMutating}
            >
              <Plus className="size-4" />
              Novo tópico
            </Button>
          ) : null}

          {hasHero ? (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setDeleteOpen(true)}
              disabled={isMutating}
            >
              <Trash2 className="size-4" />
              Remover hero
            </Button>
          ) : null}
        </div>
      </div>

      {heroQuery.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="size-24 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {heroQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{heroQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {heroQuery.isSuccess && !hasHero ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Image className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhuma seção hero cadastrada.
            </p>
            <Button
              className="mt-2 gap-2"
              onClick={openCreate}
              disabled={isMutating}
            >
              <Plus className="size-4" />
              Criar seção hero
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasHero ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {heroSection.map((topic, index) => {
                const itemId = sortableIds[index] ?? `hero-topic-${String(index)}`
                return (
                <SortableHeroTopicCard
                  key={itemId}
                  id={itemId}
                  topic={topic}
                  index={index}
                  onEdit={() => openEdit(index)}
                  onRemove={() => handleRemoveTopic(index)}
                  canRemove={heroSection.length > 1}
                  disabled={isMutating}
                />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      <HeroTopicEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        topic={editingTopic}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleTopicSubmit}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover seção hero?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os tópicos e imagens serão removidos do rascunho. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
    </div>
  )
}
