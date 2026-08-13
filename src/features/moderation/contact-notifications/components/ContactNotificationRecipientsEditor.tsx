import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import {
  AlertCircle,
  ChevronDown,
  Info,
  Loader2,
  Mail,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  contactNotificationRecipientsFormSchema,
  defaultContactNotificationRecipientsFormValues,
  MAX_CONTACT_NOTIFICATION_RECIPIENTS,
  MAX_CONTACT_NOTIFICATION_RECIPIENT_EMAIL_LENGTH,
  MAX_CONTACT_NOTIFICATION_RECIPIENT_NAME_LENGTH,
  toContactNotificationRecipientsFormValues,
  toContactNotificationRecipientsInput,
} from '../contact-notifications.schema'
import type { ContactNotificationRecipientsFormValues } from '../contact-notifications.schema'
import {
  useContactNotificationRecipients,
  useSaveContactNotificationRecipients,
} from '../hooks/use-contact-notification-recipients'
import type { ContactNotificationRecipientsResponse } from '../types'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
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

function buildSummary(
  data: ContactNotificationRecipientsResponse | undefined,
  isError: boolean,
): string {
  if (isError) return 'Não foi possível carregar a lista.'
  if (!data) return 'Carregando…'

  if (data.recipients.length === 0) {
    return `Usando o endereço padrão do ambiente: ${data.fallbackEmail}`
  }

  return data.recipients.map((recipient) => recipient.email).join(', ')
}

export function ContactNotificationRecipientsEditor() {
  const [isOpen, setIsOpen] = useState(false)
  const recipientsQuery = useContactNotificationRecipients()
  const saveMutation = useSaveContactNotificationRecipients()
  const form = useForm<ContactNotificationRecipientsFormValues>({
    resolver: zodResolver(contactNotificationRecipientsFormSchema),
    defaultValues: defaultContactNotificationRecipientsFormValues,
    mode: 'onBlur',
  })
  const isDirty: boolean = form.formState.isDirty
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'recipients',
  })

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas nos destinatários das notificações. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!recipientsQuery.isSuccess) return
    form.reset(toContactNotificationRecipientsFormValues(recipientsQuery.data))
  }, [form, recipientsQuery.data, recipientsQuery.isSuccess])

  const hasValidationErrors: boolean =
    form.formState.submitCount > 0 &&
    Object.keys(form.formState.errors).length > 0
  const isSaving: boolean = saveMutation.isPending
  const canAddRecipient: boolean =
    fields.length < MAX_CONTACT_NOTIFICATION_RECIPIENTS

  function handleSubmit(values: ContactNotificationRecipientsFormValues): void {
    saveMutation.mutate(toContactNotificationRecipientsInput(values), {
      onSuccess: (response): void => {
        form.reset(toContactNotificationRecipientsFormValues(response))
        toast.success('Destinatários das notificações atualizados.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  return (
    <Card className="py-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/40"
          >
            <Mail
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1">
              <CardTitle>Destinatários das notificações</CardTitle>
              <CardDescription className="mt-1 truncate">
                {buildSummary(recipientsQuery.data, recipientsQuery.isError)}
              </CardDescription>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180"
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t py-4">
            {recipientsQuery.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : null}

            {recipientsQuery.isError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Não foi possível carregar os destinatários</AlertTitle>
                <AlertDescription>
                  <p>{recipientsQuery.error.message}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(): void => {
                      void recipientsQuery.refetch()
                    }}
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            {recipientsQuery.isSuccess ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  <p className="text-sm text-muted-foreground">
                    Cada envio do formulário do site gera um e-mail para todos os
                    endereços desta lista. Responder o e-mail responde direto
                    para o visitante.
                  </p>

                  {!recipientsQuery.data.isEmailDeliveryConfigured ? (
                    <Alert>
                      <AlertCircle aria-hidden="true" />
                      <AlertTitle>Envio de e-mails indisponível</AlertTitle>
                      <AlertDescription>
                        Este ambiente não está configurado para enviar e-mails.
                        Os contatos continuam sendo salvos e listados aqui, mas
                        nenhuma notificação sai até a configuração ser concluída.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {fields.length === 0 ? (
                    <Alert>
                      <Info aria-hidden="true" />
                      <AlertTitle>Nenhum destinatário cadastrado</AlertTitle>
                      <AlertDescription>
                        Com a lista vazia, as notificações continuam indo para{' '}
                        <strong>{recipientsQuery.data.fallbackEmail}</strong>, o
                        endereço padrão do ambiente.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {hasValidationErrors ? (
                    <Alert variant="destructive">
                      <AlertCircle aria-hidden="true" />
                      <AlertTitle>Revise os campos destacados</AlertTitle>
                      <AlertDescription>
                        Corrija os valores inválidos antes de salvar.
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
                    {fields.map((recipientField, index) => (
                      <div
                        key={recipientField.id}
                        className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start"
                      >
                        <FormField
                          control={form.control}
                          name={
                            `recipients.${String(index)}.email` as `recipients.${number}.email`
                          }
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  inputMode="email"
                                  autoComplete="off"
                                  placeholder="comercial@tessa.com.br"
                                  maxLength={
                                    MAX_CONTACT_NOTIFICATION_RECIPIENT_EMAIL_LENGTH
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={
                            `recipients.${String(index)}.name` as `recipients.${number}.name`
                          }
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Identificação (opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  autoComplete="off"
                                  placeholder="Comercial"
                                  maxLength={
                                    MAX_CONTACT_NOTIFICATION_RECIPIENT_NAME_LENGTH
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="sm:mt-8"
                          aria-label={`Remover destinatário ${String(index + 1)}`}
                          disabled={isSaving}
                          onClick={(): void => {
                            remove(index)
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    ))}

                    {form.formState.errors.recipients?.root?.message ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.recipients.root.message}
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      disabled={!canAddRecipient || isSaving}
                      onClick={(): void => {
                        append({ email: '', name: '' })
                      }}
                    >
                      <Plus aria-hidden="true" />
                      Adicionar destinatário
                    </Button>
                    <FormDescription>
                      Máximo de {String(MAX_CONTACT_NOTIFICATION_RECIPIENTS)}{' '}
                      destinatários.
                    </FormDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                      ) : (
                        <Save aria-hidden="true" className="size-4" />
                      )}
                      Salvar destinatários
                    </Button>
                  </div>
                </form>
              </Form>
            ) : null}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
