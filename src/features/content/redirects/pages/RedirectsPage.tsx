import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDateTime } from '@/shared/lib/format'
import { useAdminBlogArticles } from '@/features/content/blog/hooks/use-admin-blog-articles'
import { useServices } from '@/features/content/services/hooks/use-services'
import { isSlugChangeDestinationMissing } from '../destination-status'
import {
  useCreateRedirect,
  useDeleteRedirect,
  useRedirects,
  useUpdateRedirect,
} from '../hooks/use-redirects'
import {
  defaultRedirectFormValues,
  redirectFormSchema,
  type RedirectFormValues,
} from '../redirects.schema'
import type { RedirectRecord } from '../types'

const PER_PAGE = 20

function sourceLabel(source: RedirectRecord['source']): string {
  return source === 'slugChange' ? 'Automático' : 'Manual'
}

export function RedirectsPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<RedirectRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<RedirectRecord | null>(null)

  const listParams = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      ...(query.trim() ? { q: query.trim() } : {}),
    }),
    [page, query],
  )
  const listQuery = useRedirects(listParams)
  const blogQuery = useAdminBlogArticles({ page: 1, perPage: 200 })
  const servicesQuery = useServices()
  const createMutation = useCreateRedirect()
  const updateMutation = useUpdateRedirect()
  const deleteMutation = useDeleteRedirect()

  const liveDestinations = useMemo(
    () => ({
      blogSlugs: new Set(
        (blogQuery.data?.articles ?? []).map((article) => article.slug),
      ),
      serviceSlugs: new Set(
        (servicesQuery.data?.servicesPages ?? []).map((page) => page.slug),
      ),
    }),
    [blogQuery.data?.articles, servicesQuery.data?.servicesPages],
  )

  const form = useForm<RedirectFormValues>({
    resolver: zodResolver(redirectFormSchema),
    defaultValues: defaultRedirectFormValues,
    mode: 'onBlur',
  })

  const redirects = listQuery.data?.redirects ?? []
  const pagination = listQuery.data?.pagination
  const isSaving = createMutation.isPending || updateMutation.isPending

  function openCreate(): void {
    setEditing(null)
    form.reset(defaultRedirectFormValues)
    setEditorOpen(true)
  }

  function openEdit(record: RedirectRecord): void {
    setEditing(record)
    form.reset({
      fromPath: record.fromPath,
      toPath: record.toPath,
      statusCode: record.statusCode === 302 ? 302 : 301,
    })
    setEditorOpen(true)
  }

  function handleSubmit(values: RedirectFormValues): void {
    const input = {
      fromPath: values.fromPath.trim(),
      toPath: values.toPath.trim(),
      statusCode: values.statusCode,
    }

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, input },
        {
          onSuccess: (): void => {
            toast.success('Redirecionamento atualizado. Vale imediatamente, sem publicar.')
            setEditorOpen(false)
          },
          onError: (error: Error): void => {
            toast.error(error.message)
          },
        },
      )
      return
    }

    createMutation.mutate(input, {
      onSuccess: (): void => {
        toast.success('Redirecionamento criado. Vale imediatamente, sem publicar.')
        setEditorOpen(false)
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Redirecionamentos
        </h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Caminhos antigos passam a responder 301 assim que você salva. Esta
          tela não entra na barra de publicar — use-a também para URLs herdadas
          do site anterior.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Mapa de redirecionamentos</CardTitle>
            <CardDescription>
              Origem e destino sem prefixo de idioma. Destino interno segue o
              idioma do visitante; URL absoluta sai do site.
            </CardDescription>
          </div>
          <Button type="button" onClick={openCreate}>
            <Plus aria-hidden="true" className="size-4" />
            Novo redirecionamento
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="relative block max-w-md">
            <span className="sr-only">Buscar por caminho</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="/blog/post-antigo"
              value={query}
              onChange={(event): void => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </label>

          {listQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>Não foi possível carregar</AlertTitle>
              <AlertDescription>
                {listQuery.error.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-28">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listQuery.isPending ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              ) : redirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Nenhum redirecionamento cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                redirects.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono">{record.fromPath}</TableCell>
                    <TableCell>
                      <span className="font-mono">{record.toPath}</span>
                      {blogQuery.isSuccess &&
                      servicesQuery.isSuccess &&
                      isSlugChangeDestinationMissing(
                        record,
                        liveDestinations,
                      ) ? (
                        <span className="mt-1 block text-xs text-destructive">
                          Destino responde 404 — o conteúdo foi excluído.
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{String(record.statusCode)}</TableCell>
                    <TableCell>{sourceLabel(record.source)}</TableCell>
                    <TableCell>{formatDateTime(record.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Editar ${record.fromPath}`}
                          onClick={(): void => {
                            openEdit(record)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Excluir ${record.fromPath}`}
                          onClick={(): void => {
                            setPendingDelete(record)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Página {String(pagination.page)} de {String(pagination.totalPages)}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={(): void => {
                    setPage((current) => Math.max(1, current - 1))
                  }}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={(): void => {
                    setPage((current) => current + 1)
                  }}
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar redirecionamento' : 'Novo redirecionamento'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Ao editar um redirecionamento automático, ele vira manual e deixa de ser sobrescrito por mudança de slug.'
                : 'Vale assim que salvar, sem passar pela publicação do conteúdo.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4"
              noValidate
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="fromPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <FormControl>
                      <Input placeholder="/blog/post-antigo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Caminho interno, sem prefixo de idioma.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/blog/post-novo"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Caminho interno ou URL absoluta http(s).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statusCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código HTTP</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-input/20 px-2 text-sm"
                        value={String(field.value)}
                        onChange={(event): void => {
                          field.onChange(Number(event.target.value) as 301 | 302)
                        }}
                        onBlur={field.onBlur}
                      >
                        <option value="301">301 permanente</option>
                        <option value="302">302 temporário</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(): void => {
                    setEditorOpen(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : null}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open): void => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir redirecionamento?</AlertDialogTitle>
            <AlertDialogDescription>
              A URL {pendingDelete?.fromPath} volta a responder 404. Buscadores
              e visitantes que ainda usam o caminho antigo não serão mais
              enviados para {pendingDelete?.toPath}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(): void => {
                if (!pendingDelete) return
                deleteMutation.mutate(pendingDelete.id, {
                  onSuccess: (): void => {
                    toast.success('Redirecionamento excluído.')
                    setPendingDelete(null)
                  },
                  onError: (error: Error): void => {
                    toast.error(error.message)
                  },
                })
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
