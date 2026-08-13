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
  defaultCompanyInformationFormValues,
  companyInformationFormSchema,
  MAX_COMPANY_ADDRESS_LENGTH,
  MAX_COMPANY_EMAIL_LENGTH,
  MAX_COMPANY_NAME_LENGTH,
  MAX_COMPANY_PHONE_CONTACTS,
  MAX_COMPANY_PHONE_LENGTH,
  MAX_COMPANY_ZIP_CODE_LENGTH,
  toCompanyInformationFormValues,
  toCompanyInformationInput,
} from '../company-information.schema'
import type { CompanyInformationFormValues } from '../company-information.schema'
import {
  useCompanyInformation,
  useDeleteCompanyInformation,
  useSaveCompanyInformation,
} from '../hooks/use-company-information'
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
import { Textarea } from '@/shared/components/ui/textarea'
import {
  formatBrazilMobileDisplay,
  formatCnpjDisplay,
  normalizeBrazilPhoneDigits,
} from '@/shared/lib/brazil-ids'

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

function CompanyInformationEditorSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function CompanyInformationEditor() {
  const companyQuery = useCompanyInformation()
  const hasSection: boolean = companyQuery.data !== null
  const saveMutation = useSaveCompanyInformation(hasSection)
  const deleteMutation = useDeleteCompanyInformation()
  const form = useForm<CompanyInformationFormValues>({
    resolver: zodResolver(companyInformationFormSchema),
    defaultValues: defaultCompanyInformationFormValues,
    mode: 'onBlur',
  })
  const isDirty: boolean = form.formState.isDirty
  const companyName: string = useWatch({
    control: form.control,
    name: 'name',
  })
  const companyAddress: string = useWatch({
    control: form.control,
    name: 'address',
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'phoneContacts',
  })

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas nas informações da empresa. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!companyQuery.isSuccess) return
    form.reset(toCompanyInformationFormValues(companyQuery.data))
  }, [form, companyQuery.data, companyQuery.isSuccess])

  const hasValidationErrors: boolean =
    form.formState.submitCount > 0 &&
    Object.keys(form.formState.errors).length > 0
  const isSaving: boolean = saveMutation.isPending
  const isDeleting: boolean = deleteMutation.isPending
  const canAddPhone: boolean = fields.length < MAX_COMPANY_PHONE_CONTACTS

  useRegisterPublicationEditorState({
    id: 'company-information',
    label: 'Informações da empresa',
    tab: 'informacoes-da-empresa',
    isDirty,
    isInvalid: hasValidationErrors,
    isUploading: false,
  })

  function handleSubmit(values: CompanyInformationFormValues): void {
    const input = toCompanyInformationInput(values)

    saveMutation.mutate(input, {
      onSuccess: (response): void => {
        form.reset(toCompanyInformationFormValues(response.companyInformation))
        toast.success('Rascunho das informações da empresa salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleDelete(): void {
    deleteMutation.mutate(undefined, {
      onSuccess: (): void => {
        form.reset(defaultCompanyInformationFormValues)
        toast.success('Rascunho das informações da empresa removido.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (companyQuery.isPending) {
    return <CompanyInformationEditorSkeleton />
  }

  if (companyQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>
          Não foi possível carregar as informações da empresa
        </AlertTitle>
        <AlertDescription>
          <p>{companyQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(): void => {
              void companyQuery.refetch()
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
        <CardTitle>Informações da empresa</CardTitle>
        <CardDescription>
          Endereço, telefones, WhatsApp, e-mail, CNPJ e razão social aparecem no
          rodapé e na página de contato. Estes dados não são traduzidos.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Razão social</FormLabel>
                    <CharacterCounter
                      current={companyName.length}
                      maximum={MAX_COMPANY_NAME_LENGTH}
                    />
                  </div>
                  <FormControl>
                    <Input
                      maxLength={MAX_COMPANY_NAME_LENGTH}
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome legal exibido no rodapé e nos dados estruturados.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="00.000.000/0001-00"
                      {...field}
                      onChange={(event): void => {
                        field.onChange(formatCnpjDisplay(event.target.value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Endereço</FormLabel>
                    <CharacterCounter
                      current={companyAddress.length}
                      maximum={MAX_COMPANY_ADDRESS_LENGTH}
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      maxLength={MAX_COMPANY_ADDRESS_LENGTH}
                      rows={3}
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Logradouro, número, bairro e cidade, como devem aparecer no
                    rodapé.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={MAX_COMPANY_ZIP_CODE_LENGTH}
                        autoComplete="postal-code"
                        placeholder="00000-000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        maxLength={MAX_COMPANY_EMAIL_LENGTH}
                        autoComplete="email"
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
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={(event): void => {
                        field.onChange(
                          formatBrazilMobileDisplay(
                            normalizeBrazilPhoneDigits(event.target.value),
                          ),
                        )
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Celular com DDD. O visitante abre uma conversa neste número
                    ao clicar no rodapé ou na página de contato.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Telefones</FormLabel>
              <FormDescription>
                Cada número vira um link clicável no rodapé. Máximo de{' '}
                {String(MAX_COMPANY_PHONE_CONTACTS)}.
              </FormDescription>
              {fields.map((phoneField, index) => (
                <FormField
                  key={phoneField.id}
                  control={form.control}
                  name={
                    `phoneContacts.${String(index)}.phone` as `phoneContacts.${number}.phone`
                  }
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-2">
                        <FormControl>
                          <Input
                            maxLength={MAX_COMPANY_PHONE_LENGTH}
                            inputMode="tel"
                            autoComplete="tel"
                            aria-label={`Telefone ${String(index + 1)}`}
                            {...field}
                          />
                        </FormControl>
                        {fields.length > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Remover telefone ${String(index + 1)}`}
                            disabled={isSaving || isDeleting}
                            onClick={(): void => {
                              remove(index)
                            }}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        ) : null}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {form.formState.errors.phoneContacts?.root?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phoneContacts.root.message}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={!canAddPhone || isSaving || isDeleting}
                onClick={(): void => {
                  append({ phone: '' })
                }}
              >
                <Plus aria-hidden="true" />
                Adicionar telefone
              </Button>
            </div>

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
                        Remover rascunho das informações da empresa?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        A landing volta a usar endereço, telefones e e-mail
                        padrão até um novo rascunho ser publicado.
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
