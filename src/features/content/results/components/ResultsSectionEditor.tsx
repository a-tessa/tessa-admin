import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import {
  AlertCircle,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  defaultResultsSectionFormValues,
  emptyResultsStatFormValue,
  formatResultStatDisplay,
  MAX_RESULTS_LABEL_LENGTH,
  MAX_RESULTS_STATS,
  MIN_RESULTS_STATS,
  resultsSectionFormSchema,
  toResultsSectionFormValues,
  toResultsSectionInput,
} from '../results.schema'
import type { ResultsSectionFormValues } from '../results.schema'
import {
  useDeleteResultsSection,
  useResultsSection,
  useSaveResultsSection,
} from '../hooks/use-results-section'
import { useRegisterPublicationEditorState } from '@/features/content/publish/publication-readiness'
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

function CharacterCounter({
  current,
  maximum,
}: {
  readonly current: number
  readonly maximum: number
}) {
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {String(current)} / {String(maximum)}
    </span>
  )
}

function ResultsEditorSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-xl border p-4">
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ResultsSectionEditor() {
  const resultsQuery = useResultsSection()
  const hasSection: boolean = resultsQuery.data !== null
  const saveMutation = useSaveResultsSection(hasSection)
  const deleteMutation = useDeleteResultsSection()
  const form = useForm<ResultsSectionFormValues>({
    resolver: zodResolver(resultsSectionFormSchema),
    defaultValues: defaultResultsSectionFormValues,
    mode: 'onBlur',
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stats',
  })
  const stats = useWatch({
    control: form.control,
    name: 'stats',
  })
  const isDirty: boolean = form.formState.isDirty
  const canAddStat: boolean = fields.length < MAX_RESULTS_STATS
  const canRemoveStat: boolean = fields.length > MIN_RESULTS_STATS

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas na seção Resultados. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!resultsQuery.isSuccess) return
    form.reset(toResultsSectionFormValues(resultsQuery.data))
  }, [form, resultsQuery.data, resultsQuery.isSuccess])

  const hasValidationErrors: boolean =
    form.formState.submitCount > 0 &&
    Object.keys(form.formState.errors).length > 0
  const isSaving: boolean = saveMutation.isPending
  const isDeleting: boolean = deleteMutation.isPending

  useRegisterPublicationEditorState({
    id: 'homepage-results',
    label: 'Resultados',
    tab: 'resultados',
    isDirty,
    isInvalid: hasValidationErrors,
    isUploading: false,
  })

  function handleSubmit(values: ResultsSectionFormValues): void {
    const input = toResultsSectionInput(values)

    saveMutation.mutate(input, {
      onSuccess: (response): void => {
        form.reset(toResultsSectionFormValues(response.resultsSection))
        toast.success('Rascunho da seção Resultados salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleDelete(): void {
    deleteMutation.mutate(undefined, {
      onSuccess: (): void => {
        form.reset(defaultResultsSectionFormValues)
        toast.success('Rascunho da seção Resultados removido.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (resultsQuery.isPending) {
    return <ResultsEditorSkeleton />
  }

  if (resultsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar Resultados</AlertTitle>
        <AlertDescription>
          <p>{resultsQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(): void => {
              void resultsQuery.refetch()
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
        <CardTitle>Números da seção Resultados</CardTitle>
        <CardDescription>
          Edite o valor completo e o texto de cada número. Dá para ter de{' '}
          {String(MIN_RESULTS_STATS)} a {String(MAX_RESULTS_STATS)} números. A
          partir de 1.000 o valor vira K; a partir de 1.000.000 vira MI. O
          prefixo + permanece fixo. Os textos são escritos em português e
          localizados automaticamente na publicação.
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

            <div className="space-y-4">
              {fields.map((statField, index) => {
                const currentStat = stats[index]
                const labelLength: number = currentStat
                  ? currentStat.label.trim().length
                  : 0

                return (
                  <div
                    key={statField.id}
                    className="space-y-4 rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-medium">
                        Número {String(index + 1)}
                      </h3>
                      {canRemoveStat ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Remover número ${String(index + 1)}`}
                          disabled={isSaving || isDeleting}
                          onClick={(): void => {
                            remove(index)
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>

                    <FormField
                      control={form.control}
                      name={
                        `stats.${String(index)}.value` as `stats.${number}.value`
                      }
                      render={({ field }) => {
                        const parsedValue = /^\d+$/.test(field.value)
                          ? Number(field.value)
                          : null

                        return (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                className="max-w-xs tabular-nums"
                                placeholder="8000000"
                                name={field.name}
                                ref={field.ref}
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={(event): void => {
                                  field.onChange(
                                    event.target.value.replace(/\D/g, ''),
                                  )
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              {parsedValue === null
                                ? 'Digite o número completo, por exemplo 8000000.'
                                : `Exibido como ${formatResultStatDisplay(parsedValue)}`}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={
                        `stats.${String(index)}.label` as `stats.${number}.label`
                      }
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between gap-3">
                            <FormLabel>Texto</FormLabel>
                            <CharacterCounter
                              current={labelLength}
                              maximum={MAX_RESULTS_LABEL_LENGTH}
                            />
                          </div>
                          <FormControl>
                            <Input
                              maxLength={MAX_RESULTS_LABEL_LENGTH}
                              placeholder="de m² em estruturas metálicas"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )
              })}
            </div>

            {form.formState.errors.stats?.root?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.stats.root.message}
              </p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              disabled={!canAddStat || isSaving || isDeleting}
              onClick={(): void => {
                append(emptyResultsStatFormValue)
              }}
            >
              <Plus aria-hidden="true" />
              Adicionar número
            </Button>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={isSaving || isDeleting}>
                {isSaving ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Save aria-hidden="true" className="size-4" />
                )}
                Salvar rascunho
              </Button>

              {hasSection ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving || isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                      ) : (
                        <Trash2 aria-hidden="true" className="size-4" />
                      )}
                      Remover rascunho
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remover rascunho de Resultados?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        A landing volta a usar os números padrão até um novo
                        rascunho ser publicado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
