import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  Video,
} from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  defaultIndustrySectionFormValues,
  getYouTubeVideoId,
  industrySectionFormSchema,
  MAX_INDUSTRY_SUBTITLE_LENGTH,
  MAX_INDUSTRY_TITLE_LENGTH,
  MAX_INDUSTRY_TITLE_PREFIX_LENGTH,
  toIndustrySectionFormValues,
  toIndustrySectionInput,
} from '../industry.schema'
import type { IndustrySectionFormValues } from '../industry.schema'
import {
  useDeleteIndustrySection,
  useIndustrySection,
  useSaveIndustrySection,
} from '../hooks/use-industry-section'
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

interface CharacterCounterProps {
  readonly current: number
  readonly maximum: number
}

function CharacterCounter({
  current,
  maximum,
}: CharacterCounterProps) {
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {String(current)} / {String(maximum)}
    </span>
  )
}

interface IndustryPreviewProps {
  readonly titlePrefix: string
  readonly title: string
  readonly subtitle: string
  readonly videoUrl: string
  readonly startSeconds: string
}

function IndustryPreview({
  titlePrefix,
  title,
  subtitle,
  videoUrl,
  startSeconds,
}: IndustryPreviewProps) {
  const videoId: string | null = getYouTubeVideoId(videoUrl)
  const parsedStartSeconds: number | null = /^\d+$/.test(startSeconds)
    ? Number.parseInt(startSeconds, 10)
    : null
  const embedUrl: string | null = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${
        parsedStartSeconds !== null && parsedStartSeconds > 0
          ? `&start=${String(parsedStartSeconds)}`
          : ''
      }`
    : null

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Prévia responsiva</CardTitle>
        <CardDescription>
          Representação da seção publicada em português.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <section
          aria-labelledby="industry-preview-title"
          className="grid gap-8 rounded-xl bg-background p-5 shadow-sm ring-1 ring-foreground/5 md:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,550px)] xl:items-center"
        >
          <div className="text-left">
            <h3
              id="industry-preview-title"
              className="font-industry text-balance whitespace-pre-line text-3xl font-bold leading-tight uppercase text-foreground sm:text-4xl"
            >
              <span className="text-primary">
                {titlePrefix || 'Prefixo do título'}
              </span>
              {'\n'}
              {title || 'Título principal'}
            </h3>
            <p className="mt-2 max-w-3xl text-pretty text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-sm">
              {subtitle || 'O subtítulo da seção aparecerá aqui.'}
            </p>
            <div
              aria-hidden="true"
              className="mt-4 h-1 w-20 rounded-full bg-primary/70"
            />
          </div>

          <div className="relative mx-auto aspect-video w-full max-w-137.5 overflow-hidden rounded-3xl bg-muted shadow-lg ring-1 ring-foreground/10 xl:max-w-none">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Prévia do vídeo da seção Indústria"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="size-full"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
                <Video aria-hidden="true" className="size-8" />
                <p className="text-sm">
                  Informe uma URL válida para visualizar o vídeo.
                </p>
              </div>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

function IndustryEditorSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Skeleton className="min-h-96 rounded-xl" />
    </div>
  )
}

export function IndustrySectionEditor() {
  const industryQuery = useIndustrySection()
  const hasSection: boolean = industryQuery.data !== null
  const saveMutation = useSaveIndustrySection(hasSection)
  const deleteMutation = useDeleteIndustrySection()
  const form = useForm<IndustrySectionFormValues>({
    resolver: zodResolver(industrySectionFormSchema),
    defaultValues: defaultIndustrySectionFormValues,
    mode: 'onBlur',
  })
  const isDirty: boolean = form.formState.isDirty

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas na seção Indústria. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!industryQuery.isSuccess) return

    form.reset(toIndustrySectionFormValues(industryQuery.data))
  }, [form, industryQuery.data, industryQuery.isSuccess])

  const titlePrefix: string = useWatch({
    control: form.control,
    name: 'titlePrefix',
  })
  const title: string = useWatch({
    control: form.control,
    name: 'title',
  })
  const subtitle: string = useWatch({
    control: form.control,
    name: 'subtitle',
  })
  const videoUrl: string = useWatch({
    control: form.control,
    name: 'videoUrl',
  })
  const startSeconds: string = useWatch({
    control: form.control,
    name: 'startSeconds',
  })
  const hasValidationErrors: boolean =
    form.formState.submitCount > 0 &&
    Object.keys(form.formState.errors).length > 0
  const isSaving: boolean = saveMutation.isPending
  const isDeleting: boolean = deleteMutation.isPending

  function handleSubmit(values: IndustrySectionFormValues): void {
    const input = toIndustrySectionInput(values)

    saveMutation.mutate(input, {
      onSuccess: (response): void => {
        form.reset(toIndustrySectionFormValues(response.industrySection))
        toast.success('Rascunho da seção Indústria salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleDelete(): void {
    deleteMutation.mutate(undefined, {
      onSuccess: (): void => {
        form.reset(defaultIndustrySectionFormValues)
        toast.success('Rascunho da seção Indústria removido.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (industryQuery.isPending) {
    return <IndustryEditorSkeleton />
  }

  if (industryQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar a seção Indústria</AlertTitle>
        <AlertDescription>
          <p>{industryQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(): void => {
              void industryQuery.refetch()
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo em português</CardTitle>
          <CardDescription>
            Edite os textos e o vídeo usados como fonte da seção Indústria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
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
                  <AlertDescription>
                    {saveMutation.error.message}
                  </AlertDescription>
                </Alert>
              ) : null}

              <FormField
                control={form.control}
                name="titlePrefix"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Prefixo do título</FormLabel>
                      <CharacterCounter
                        current={field.value.length}
                        maximum={MAX_INDUSTRY_TITLE_PREFIX_LENGTH}
                      />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Ex.: A força da"
                        maxLength={MAX_INDUSTRY_TITLE_PREFIX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Título principal</FormLabel>
                      <CharacterCounter
                        current={field.value.length}
                        maximum={MAX_INDUSTRY_TITLE_LENGTH}
                      />
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Ex.: indústria brasileira"
                        maxLength={MAX_INDUSTRY_TITLE_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Subtítulo</FormLabel>
                      <CharacterCounter
                        current={field.value.length}
                        maximum={MAX_INDUSTRY_SUBTITLE_LENGTH}
                      />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a atuação da Tessa na indústria."
                        maxLength={MAX_INDUSTRY_SUBTITLE_LENGTH}
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do YouTube — Português</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          inputMode="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Aceita links youtube.com e youtu.be.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo inicial</FormLabel>
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
                        disabled={isSaving || isDeleting}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Remover rascunho
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remover a seção Indústria do rascunho?
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
                  disabled={!isDirty || isSaving || isDeleting}
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

      <IndustryPreview
        titlePrefix={titlePrefix}
        title={title}
        subtitle={subtitle}
        videoUrl={videoUrl}
        startSeconds={startSeconds}
      />
    </div>
  )
}
