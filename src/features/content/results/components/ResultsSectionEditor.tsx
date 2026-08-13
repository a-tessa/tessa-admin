import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import { AlertCircle, Loader2, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  defaultResultsSectionFormValues,
  RESULTS_STAT_FIELDS,
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

function ResultsEditorSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-10 w-full max-w-xs" />
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
  const isDirty: boolean = form.formState.isDirty

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
          Altere apenas os três valores exibidos na faixa de resultados. Título,
          prefixos e labels continuam fixos na landing.
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

            {RESULTS_STAT_FIELDS.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        className="max-w-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Número inteiro animado na landing (prefixo e sufixo fixos).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

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
