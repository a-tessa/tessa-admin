import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import { AlertCircle, Loader2, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  defaultFooterSectionFormValues,
  footerSectionFormSchema,
  MAX_FOOTER_NEWSLETTER_SUB_LENGTH,
  MAX_FOOTER_NEWSLETTER_TITLE_LENGTH,
  toFooterSectionFormValues,
  toFooterSectionInput,
} from '../footer.schema'
import type { FooterSectionFormValues } from '../footer.schema'
import {
  useDeleteFooterSection,
  useFooterSection,
  useSaveFooterSection,
} from '../hooks/use-footer-section'
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

function FooterEditorSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function FooterSectionEditor() {
  const footerQuery = useFooterSection()
  const hasSection: boolean = footerQuery.data !== null
  const saveMutation = useSaveFooterSection(hasSection)
  const deleteMutation = useDeleteFooterSection()
  const form = useForm<FooterSectionFormValues>({
    resolver: zodResolver(footerSectionFormSchema),
    defaultValues: defaultFooterSectionFormValues,
    mode: 'onBlur',
  })
  const isDirty: boolean = form.formState.isDirty
  const newsletterTitle: string = useWatch({
    control: form.control,
    name: 'newsletterTitle',
  })
  const newsletterSub: string = useWatch({
    control: form.control,
    name: 'newsletterSub',
  })

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas no rodapé. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!footerQuery.isSuccess) return
    form.reset(toFooterSectionFormValues(footerQuery.data))
  }, [form, footerQuery.data, footerQuery.isSuccess])

  const hasValidationErrors: boolean =
    form.formState.submitCount > 0 &&
    Object.keys(form.formState.errors).length > 0
  const isSaving: boolean = saveMutation.isPending
  const isDeleting: boolean = deleteMutation.isPending

  useRegisterPublicationEditorState({
    id: 'homepage-footer',
    label: 'Rodapé',
    tab: 'rodape',
    isDirty,
    isInvalid: hasValidationErrors,
    isUploading: false,
  })

  function handleSubmit(values: FooterSectionFormValues): void {
    const input = toFooterSectionInput(values)

    saveMutation.mutate(input, {
      onSuccess: (response): void => {
        form.reset(toFooterSectionFormValues(response.footerSection))
        toast.success('Rascunho do rodapé salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleDelete(): void {
    deleteMutation.mutate(undefined, {
      onSuccess: (): void => {
        form.reset(defaultFooterSectionFormValues)
        toast.success('Rascunho do rodapé removido.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (footerQuery.isPending) {
    return <FooterEditorSkeleton />
  }

  if (footerQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar o rodapé</AlertTitle>
        <AlertDescription>
          <p>{footerQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(): void => {
              void footerQuery.refetch()
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
        <CardTitle>Newsletter do rodapé</CardTitle>
        <CardDescription>
          Estes textos aparecem acima do campo de e-mail no rodapé. Português é
          a fonte; inglês e espanhol são traduzidos na publicação.
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
              name="newsletterTitle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Título</FormLabel>
                    <CharacterCounter
                      current={newsletterTitle.length}
                      maximum={MAX_FOOTER_NEWSLETTER_TITLE_LENGTH}
                    />
                  </div>
                  <FormControl>
                    <Input
                      maxLength={MAX_FOOTER_NEWSLETTER_TITLE_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Exibido em destaque acima do formulário de e-mail.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newsletterSub"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Subtítulo</FormLabel>
                    <CharacterCounter
                      current={newsletterSub.length}
                      maximum={MAX_FOOTER_NEWSLETTER_SUB_LENGTH}
                    />
                  </div>
                  <FormControl>
                    <Input
                      maxLength={MAX_FOOTER_NEWSLETTER_SUB_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Linha de apoio abaixo do título.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        Remover rascunho do rodapé?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        A landing volta a usar os textos padrão até um novo
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
