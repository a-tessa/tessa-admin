import {
  Briefcase,
  ChevronDown,
  ExternalLink,
  ImageIcon,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServices } from '../hooks/use-services'
import { useCreateService } from '../hooks/use-create-service'
import { useUpdateService } from '../hooks/use-update-service'
import { useDeleteService } from '../hooks/use-delete-service'
import { ServiceForm } from '../components/ServiceForm'
import type { ServicePage, ServicePageFormData } from '../types'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'

const MAX_IMAGES = 15
const MAX_FILE_SIZE_MB = 4
const ACCEPTED_FORMATS = 'JPEG, PNG, WebP, GIF'

function ImageThumbnail({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <div className="flex size-full items-center justify-center bg-muted">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="size-full object-cover"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function ImageFormatBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="gap-1 text-xs font-normal cursor-help">
          <Info className="size-3" />
          {ACCEPTED_FORMATS} &middot; max {String(MAX_FILE_SIZE_MB)} MB
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-64">
        <p className="text-xs">
          Formatos aceitos: <strong>{ACCEPTED_FORMATS}</strong>.
          Tamanho máximo por arquivo: <strong>{String(MAX_FILE_SIZE_MB)} MB</strong>.
          Imagens são convertidas para WebP automaticamente pelo servidor.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

function ServicePreview({ service }: { service: ServicePage }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow label="Subtítulo">
          <p className="text-muted-foreground leading-relaxed">{service.subtitle}</p>
        </DetailRow>

        <DetailRow label="Vídeo de exemplo">
          <a
            href={service.exampleVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline break-all"
          >
            <Video className="size-3.5 shrink-0" />
            <span className="truncate">{service.exampleVideoUrl}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </DetailRow>

        <DetailRow label="Slug / Categoria">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              /{service.slug}
            </Badge>
            <Badge variant="outline">{service.category}</Badge>
          </div>
        </DetailRow>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Imagem de fundo
          </p>
          <ImageFormatBadge />
        </div>
        <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
          <ImageThumbnail
            src={service.backgroundImageUrl}
            alt={`Fundo — ${service.title}`}
          />
        </div>
        <p className="text-xs text-muted-foreground break-all">
          {service.backgroundImageUrl}
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Galeria de imagens
            </p>
            <p className="text-xs text-muted-foreground">
              {String(service.images.length)} de {String(MAX_IMAGES)} imagens
            </p>
          </div>
          <ImageFormatBadge />
        </div>

        {service.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {service.images.map((image, index) => (
              <div key={image.imgUrl} className="group space-y-1.5">
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted transition-shadow group-hover:shadow-md">
                  <ImageThumbnail
                    src={image.imgUrl}
                    alt={`Imagem ${String(index + 1)} — ${service.title}`}
                  />
                  <div className="absolute bottom-1 right-1">
                    <Badge
                      variant="secondary"
                      className="bg-background/80 text-[10px] backdrop-blur-sm"
                    >
                      {String(index + 1)}
                    </Badge>
                  </div>
                </div>
                <p className="truncate text-[10px] text-muted-foreground" title={image.imgUrl}>
                  {image.imgUrl}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8">
            <ImageIcon className="size-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Nenhuma imagem na galeria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceCard({
  service,
  onUpdate,
  onDelete,
  isUpdatePending,
  isMutating,
}: {
  service: ServicePage
  onUpdate: (slug: string, data: ServicePageFormData) => void
  onDelete: () => void
  isUpdatePending: boolean
  isMutating: boolean
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [editResetKey, setEditResetKey] = useState(0)

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (mode === 'edit' && open) {
      setMode('preview')
      return
    }
    setEditResetKey((k) => k + 1)
    setMode('edit')
    setOpen(true)
  }

  function handleCancelEdit() {
    setMode('preview')
  }

  function handleSubmitEdit(data: ServicePageFormData) {
    onUpdate(service.slug, data)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setMode('preview')
    }
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <div className={cn(
        'rounded-lg border bg-card transition-colors',
        mode === 'edit' && open && 'ring-2 ring-primary/20',
        mode !== 'edit' && 'hover:bg-accent/30',
      )}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
          >
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
              <ImageThumbnail
                src={service.backgroundImageUrl}
                alt={service.title}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{service.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {service.category}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {service.slug}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ImageIcon className="size-3" />
                  {String(service.images.length)}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={mode === 'edit' && open ? 'secondary' : 'ghost'}
                    size="icon-sm"
                    disabled={isMutating}
                    onClick={handleEditClick}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {mode === 'edit' && open ? 'Voltar ao preview' : 'Editar'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isMutating}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remover</TooltipContent>
              </Tooltip>

              <ChevronDown
                className={cn(
                  'ml-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  open && 'rotate-180',
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <div className="px-4 py-4">
            {mode === 'preview' ? (
              <ServicePreview service={service} />
            ) : (
              <ServiceForm
                formId={`service-edit-${service.slug}`}
                service={service}
                isPending={isUpdatePending}
                submitLabel="Salvar"
                onSubmit={handleSubmitEdit}
                onCancel={handleCancelEdit}
                resetKey={editResetKey}
              />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function ServicesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3.5">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export function ServicesPage() {
  const servicesQuery = useServices()
  const createMutation = useCreateService()
  const updateMutation = useUpdateService()
  const deleteMutation = useDeleteService()

  const [createOpen, setCreateOpen] = useState(false)
  const [createResetKey, setCreateResetKey] = useState(0)
  const [deletingService, setDeletingService] = useState<ServicePage | null>(null)

  function handleOpenCreate() {
    setCreateResetKey((k) => k + 1)
    setCreateOpen(true)
  }

  function handleCloseCreate() {
    setCreateOpen(false)
  }

  const services = servicesQuery.data?.servicesPages
  const hasServices = services && services.length > 0
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  function handleCreate(data: ServicePageFormData) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Serviço criado.')
        setCreateOpen(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  function handleToggleCreate() {
    if (createOpen) {
      handleCloseCreate()
    } else {
      handleOpenCreate()
    }
  }

  function handleUpdate(slug: string, data: ServicePageFormData) {
    updateMutation.mutate(
      { slug, data },
      {
        onSuccess: () => toast.success('Serviço atualizado.'),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  function handleDelete() {
    if (!deletingService) return

    deleteMutation.mutate(deletingService.slug, {
      onSuccess: () => {
        toast.success('Serviço removido.')
        setDeletingService(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Serviços</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as páginas de serviço da landing page.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={handleToggleCreate}
          disabled={isMutating && !createOpen}
          variant={createOpen ? 'secondary' : 'default'}
        >
          {createOpen ? (
            <>
              <X className="size-4" />
              Fechar formulário
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Novo serviço
            </>
          )}
        </Button>
      </div>

      {createOpen ? (
        <Card className="border-primary/30 ring-2 ring-primary/10">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Novo serviço</CardTitle>
              <CardDescription>
                Preencha os dados da nova página de serviço.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCloseCreate}
              disabled={createMutation.isPending}
              aria-label="Fechar formulário"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ServiceForm
              formId="service-create-form"
              isPending={createMutation.isPending}
              submitLabel="Criar"
              onSubmit={handleCreate}
              onCancel={handleCloseCreate}
              resetKey={createResetKey}
            />
          </CardContent>
        </Card>
      ) : null}

      {servicesQuery.isPending ? <ServicesSkeleton /> : null}

      {servicesQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{servicesQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {servicesQuery.isSuccess && !hasServices && !createOpen ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Briefcase className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum serviço cadastrado.</p>
            <Button className="mt-2 gap-2" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Criar serviço
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasServices ? (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              onUpdate={handleUpdate}
              onDelete={() => setDeletingService(service)}
              isUpdatePending={updateMutation.isPending}
              isMutating={isMutating}
            />
          ))}

          <p className="pt-1 text-sm text-muted-foreground">
            {String(services.length)} serviço(s) no total
          </p>
        </div>
      ) : null}

      <AlertDialog
        open={deletingService !== null}
        onOpenChange={(open) => { if (!open) setDeletingService(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              A página de serviço <strong>{deletingService?.title}</strong> será removida
              permanentemente, incluindo todas as imagens associadas.
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
