import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContentPage } from '@/features/content/hooks/use-content-page'
import { usePublishContentPage } from '@/features/content/hooks/use-publish-content-page'
import { useUpsertContentPage } from '@/features/content/hooks/use-upsert-content-page'
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
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Textarea } from '@/shared/components/ui/textarea'

const pageFormSchema = z.object({
  title: z.string().min(2, 'Título precisa ter ao menos 2 caracteres.'),
  seoTitle: z.string().max(80, 'Máximo de 80 caracteres.').optional().or(z.literal('')),
  seoDescription: z.string().max(160, 'Máximo de 160 caracteres.').optional().or(z.literal('')),
  draftContent: z.string().min(2, 'Conteúdo não pode estar vazio.'),
})

type PageFormValues = z.infer<typeof pageFormSchema>

export function ContentPageEditPage() {
  const params = useParams({ strict: false })
  const slug = params.slug ?? ''
  const navigate = useNavigate()
  const pageQuery = useContentPage(slug)
  const upsertMutation = useUpsertContentPage()
  const publishMutation = usePublishContentPage()

  const defaultValues = useMemo<PageFormValues>(() => {
    if (!pageQuery.data) {
      return { title: '', seoTitle: '', seoDescription: '', draftContent: '{}' }
    }
    const p = pageQuery.data.page
    return {
      title: p.title,
      seoTitle: p.seoTitle ?? '',
      seoDescription: p.seoDescription ?? '',
      draftContent: JSON.stringify(p.draftContent, null, 2),
    }
  }, [pageQuery.data])

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    values: defaultValues,
  })

  function handleSave(values: PageFormValues) {
    let draftContent: Record<string, unknown>
    try {
      draftContent = JSON.parse(values.draftContent) as Record<string, unknown>
    } catch {
      toast.error('O conteúdo precisa ser um JSON válido.')
      return
    }

    upsertMutation.mutate(
      {
        slug,
        input: {
          title: values.title,
          seoTitle: values.seoTitle ?? null,
          seoDescription: values.seoDescription ?? null,
          draftContent,
        },
      },
      {
        onSuccess: () => {
          toast.success('Rascunho salvo com sucesso.')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  function handlePublish() {
    publishMutation.mutate(slug, {
      onSuccess: () => {
        toast.success('Página publicada com sucesso.')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  const isLoading = pageQuery.isPending && !pageQuery.isError
  const status = pageQuery.data?.page.status

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate({ to: '/conteudo' })}>
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {pageQuery.data?.page.title ?? slug}
            </h2>
            {status ? (
              <Badge variant={status === 'published' ? 'default' : 'secondary'}>
                {status === 'published' ? 'Publicada' : 'Rascunho'}
              </Badge>
            ) : null}
          </div>
          <p className="font-mono text-xs text-muted-foreground">/{slug}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={form.handleSubmit(handleSave)}
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar rascunho
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="gap-2" disabled={publishMutation.isPending}>
                {publishMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Publicar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Publicar página?</AlertDialogTitle>
                <AlertDialogDescription>
                  O rascunho atual será promovido para a versão publicada e ficará visível ao público imediatamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish}>Publicar agora</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título da página" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input placeholder="Título para mecanismos de busca" maxLength={80} {...field} />
                      </FormControl>
                      <FormDescription>Máximo de 80 caracteres.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição SEO</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descrição para mecanismos de busca" maxLength={160} rows={3} {...field} />
                      </FormControl>
                      <FormDescription>Máximo de 160 caracteres.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="draftContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="{}"
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON do conteúdo da landing page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      )}
    </div>
  )
}
