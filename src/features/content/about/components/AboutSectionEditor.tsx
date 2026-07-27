import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { toast } from 'sonner'
import {
  aboutSectionFormSchema,
  defaultAboutSectionFormValues,
  MAX_ABOUT_BODY_LENGTH,
  MAX_ABOUT_HERO_TITLE_LENGTH,
  MAX_ABOUT_PILLAR_DESCRIPTION_LENGTH,
  MAX_ABOUT_PILLAR_TITLE_LENGTH,
  MAX_ABOUT_SIDE_IMAGE_ALT_LENGTH,
  toAboutSectionFormValues,
  toAboutSectionInput,
} from '../about.schema'
import type { AboutSectionFormValues } from '../about.schema'
import {
  useAboutSection,
  useDeleteAboutSection,
  useSaveAboutSection,
  useUploadAboutSideImage,
} from '../hooks/use-about-section'
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
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils'

const ABOUT_SIDE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
const ABOUT_SIDE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function isAboutSideImageFile(file: File): boolean {
  return ABOUT_SIDE_IMAGE_MIME_TYPES.has(file.type)
}

interface VideoUrlFieldsProps {
  readonly control: Control<AboutSectionFormValues>
  readonly urlName: 'videoUrl' | 'videoUrlEn' | 'videoUrlEs'
  readonly startSecondsName: 'startSeconds' | 'startSecondsEn' | 'startSecondsEs'
  readonly urlLabel: string
  readonly startSecondsLabel: string
  readonly urlDescription: string
}

function VideoUrlFields({
  control,
  urlName,
  startSecondsName,
  urlLabel,
  startSecondsLabel,
  urlDescription,
}: VideoUrlFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
      <FormField
        control={control}
        name={urlName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{urlLabel}</FormLabel>
            <FormControl>
              <Input
                type="url"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=..."
                {...field}
              />
            </FormControl>
            <FormDescription>{urlDescription}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={startSecondsName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{startSecondsLabel}</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="0"
                {...field}
              />
            </FormControl>
            <FormDescription>Opcional.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

interface CharacterCounterProps {
  readonly current: number
  readonly maximum: number
}

function CharacterCounter({ current, maximum }: CharacterCounterProps) {
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {String(current)} / {String(maximum)}
    </span>
  )
}

interface PillarFieldsProps {
  readonly control: Control<AboutSectionFormValues>
  readonly name: 'mission' | 'vision' | 'values'
  readonly label: string
}

function PillarFields({ control, name, label }: PillarFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <FormField
        control={control}
        name={`${name}.title`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3">
              <FormLabel>Título</FormLabel>
              <CharacterCounter
                current={field.value.length}
                maximum={MAX_ABOUT_PILLAR_TITLE_LENGTH}
              />
            </div>
            <FormControl>
              <Input
                maxLength={MAX_ABOUT_PILLAR_TITLE_LENGTH}
                placeholder="Ex.: NOSSA MISSÃO"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${name}.description`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3">
              <FormLabel>Descrição</FormLabel>
              <CharacterCounter
                current={field.value.length}
                maximum={MAX_ABOUT_PILLAR_DESCRIPTION_LENGTH}
              />
            </div>
            <FormControl>
              <Textarea
                maxLength={MAX_ABOUT_PILLAR_DESCRIPTION_LENGTH}
                className="min-h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

function AboutEditorSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function AboutSectionEditor() {
  const aboutQuery = useAboutSection()
  const hasSection: boolean = aboutQuery.data !== null
  const saveMutation = useSaveAboutSection(hasSection)
  const deleteMutation = useDeleteAboutSection()
  const uploadMutation = useUploadAboutSideImage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const form = useForm<AboutSectionFormValues>({
    resolver: zodResolver(aboutSectionFormSchema),
    defaultValues: defaultAboutSectionFormValues,
    mode: 'onBlur',
  })
  const isDirty: boolean = form.formState.isDirty

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas em Quem Somos. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!aboutQuery.isSuccess) return
    form.reset(toAboutSectionFormValues(aboutQuery.data))
    setPreviewUrl(null)
  }, [form, aboutQuery.data, aboutQuery.isSuccess])

  useEffect((): (() => void) | undefined => {
    return (): void => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const sideImageUrl: string = useWatch({
    control: form.control,
    name: 'sideImageUrl',
  })
  const displayImage: string | null = previewUrl ?? (sideImageUrl || null)
  const hasValidationErrors: boolean =
    form.formState.submitCount > 0 &&
    Object.keys(form.formState.errors).length > 0
  const isSaving: boolean = saveMutation.isPending
  const isDeleting: boolean = deleteMutation.isPending
  const isUploading: boolean = uploadMutation.isPending

  async function handleSideImageFile(file: File): Promise<void> {
    if (!isAboutSideImageFile(file)) {
      toast.error('Use uma imagem JPEG, PNG ou WebP.')
      return
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    try {
      const uploaded = await uploadMutation.mutateAsync(file)
      form.setValue('sideImageUrl', uploaded.url, {
        shouldDirty: true,
        shouldValidate: true,
      })
      toast.success('Foto lateral enviada.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Falha no upload da foto.',
      )
      setPreviewUrl(null)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0]
    if (!file) return
    await handleSideImageFile(file)
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()
    if (isUploading) return
    setIsDragActive(true)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()
    if (isUploading) return
    event.dataTransfer.dropEffect = 'copy'
    setIsDragActive(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()
    const related = event.relatedTarget
    if (related instanceof Node && event.currentTarget.contains(related)) {
      return
    }
    setIsDragActive(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    if (isUploading) return

    const file = event.dataTransfer.files?.[0]
    if (!file) return
    void handleSideImageFile(file)
  }

  function handleClearImage(): void {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    form.setValue('sideImageUrl', '', { shouldDirty: true, shouldValidate: true })
  }

  function handleSubmit(values: AboutSectionFormValues): void {
    const input = toAboutSectionInput(values)

    saveMutation.mutate(input, {
      onSuccess: (response): void => {
        form.reset(toAboutSectionFormValues(response.aboutSection))
        setPreviewUrl(null)
        toast.success('Rascunho de Quem Somos salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleDelete(): void {
    deleteMutation.mutate(undefined, {
      onSuccess: (): void => {
        form.reset(defaultAboutSectionFormValues)
        setPreviewUrl(null)
        toast.success('Rascunho de Quem Somos removido.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (aboutQuery.isPending) {
    return <AboutEditorSkeleton />
  }

  if (aboutQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar Quem Somos</AlertTitle>
        <AlertDescription>
          <p>{aboutQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(): void => {
              void aboutQuery.refetch()
            }}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo em português</CardTitle>
        <CardDescription>
          Edite o vídeo de capa, a foto lateral, o texto e os pilares Missão,
          Visão e Valores. A landing muda apenas após a publicação global.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            {hasValidationErrors ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Revise os campos destacados</AlertTitle>
                <AlertDescription>
                  Corrija os valores inválidos antes de salvar o rascunho.
                </AlertDescription>
              </Alert>
            ) : null}

            {saveMutation.isError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{saveMutation.error.message}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="heroTitle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Título sobre o vídeo</FormLabel>
                    <CharacterCounter
                      current={field.value.length}
                      maximum={MAX_ABOUT_HERO_TITLE_LENGTH}
                    />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Ex.: NÓS SOMOS A TESSA"
                      maxLength={MAX_ABOUT_HERO_TITLE_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Vídeos por idioma
                </h3>
                <p className="text-sm text-muted-foreground">
                  Inglês e espanhol são opcionais. Quando vazios, a landing usa
                  o vídeo em português.
                </p>
              </div>

              <VideoUrlFields
                control={form.control}
                urlName="videoUrl"
                startSecondsName="startSeconds"
                urlLabel="URL do YouTube — Português"
                startSecondsLabel="Segundo inicial — Português"
                urlDescription="Aceita links youtube.com e youtu.be."
              />
              <VideoUrlFields
                control={form.control}
                urlName="videoUrlEn"
                startSecondsName="startSecondsEn"
                urlLabel="URL do YouTube — Inglês (opcional)"
                startSecondsLabel="Segundo inicial — Inglês"
                urlDescription="Deixe em branco para usar o vídeo em português."
              />
              <VideoUrlFields
                control={form.control}
                urlName="videoUrlEs"
                startSecondsName="startSecondsEs"
                urlLabel="URL do YouTube — Espanhol (opcional)"
                startSecondsLabel="Segundo inicial — Espanhol"
                urlDescription="Deixe em branco para usar o vídeo em português."
              />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Foto lateral</p>
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem para o campo ou clique para enviar (JPEG,
                  PNG ou WebP).
                </p>
              </div>
              <div
                role="button"
                tabIndex={isUploading ? -1 : 0}
                aria-label={
                  displayImage
                    ? 'Trocar foto lateral'
                    : 'Enviar foto lateral'
                }
                aria-disabled={isUploading}
                onClick={() => {
                  if (isUploading) return
                  fileInputRef.current?.click()
                }}
                onKeyDown={(event) => {
                  if (isUploading) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 transition-colors',
                  isDragActive &&
                    'border-primary bg-primary/5 ring-2 ring-primary/20',
                  displayImage && 'border-solid',
                  isUploading && 'cursor-wait opacity-80',
                )}
              >
                {displayImage ? (
                  <>
                    <img
                      src={displayImage}
                      alt="Prévia da foto lateral"
                      className="size-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleClearImage()
                      }}
                      aria-label="Remover foto"
                      disabled={isUploading}
                    >
                      <X className="size-3.5" />
                    </Button>
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Loader2 className="size-6 animate-spin text-foreground" />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
                    {isUploading ? (
                      <Loader2 className="size-8 animate-spin" />
                    ) : (
                      <ImageIcon className="size-10" />
                    )}
                    <span>
                      {isDragActive
                        ? 'Solte a imagem aqui'
                        : 'Solte a imagem aqui ou clique para selecionar'}
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ABOUT_SIDE_IMAGE_ACCEPT}
                className="hidden"
                disabled={isUploading}
                onChange={(event) => {
                  void handleFileChange(event)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {displayImage ? 'Trocar foto' : 'Enviar foto'}
              </Button>
              <FormField
                control={form.control}
                name="sideImageUrl"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sideImageAlt"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Texto alternativo da foto</FormLabel>
                      <CharacterCounter
                        current={field.value.length}
                        maximum={MAX_ABOUT_SIDE_IMAGE_ALT_LENGTH}
                      />
                    </div>
                    <FormControl>
                      <Input
                        maxLength={MAX_ABOUT_SIDE_IMAGE_ALT_LENGTH}
                        placeholder="Descreva a imagem para acessibilidade"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Texto lateral</FormLabel>
                    <CharacterCounter
                      current={field.value.length}
                      maximum={MAX_ABOUT_BODY_LENGTH}
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Separe parágrafos com uma linha em branco."
                      maxLength={MAX_ABOUT_BODY_LENGTH}
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use uma linha em branco entre parágrafos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <PillarFields
                control={form.control}
                name="mission"
                label="Missão"
              />
              <PillarFields
                control={form.control}
                name="vision"
                label="Visão"
              />
              <PillarFields
                control={form.control}
                name="values"
                label="Valores"
              />
            </div>

            <Alert>
              <Save aria-hidden="true" />
              <AlertDescription>
                Salvar atualiza o rascunho. A landing muda apenas após a
                publicação global.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {hasSection ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isSaving || isDeleting || isUploading}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Remover rascunho
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remover Quem Somos do rascunho?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        A versão publicada continuará na landing até a próxima
                        publicação global.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        Remover rascunho
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <span />
              )}

              <Button
                type="submit"
                disabled={!isDirty || isSaving || isDeleting || isUploading}
              >
                {isSaving ? (
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Save aria-hidden="true" className="size-4" />
                )}
                Salvar rascunho
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
