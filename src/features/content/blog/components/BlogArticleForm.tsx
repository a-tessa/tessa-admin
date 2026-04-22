import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import DOMPurify from 'isomorphic-dompurify'
import { ExternalLink, Info, Loader2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { categoriesListQuery } from '@/features/content/categories/categories.queries'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
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
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import type { BlogArticle, BlogArticleFormInput } from '../types'
import { HeaderImageField } from './HeaderImageField'
import { RichTextEditor } from './RichTextEditor'

const ALLOWED_HTML_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
  'code',
  'pre',
]

const ALLOWED_HTML_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel']

function sanitizeContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: ALLOWED_HTML_ATTR,
  })
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const blogArticleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'O título precisa ter ao menos 2 caracteres.')
    .max(200, 'O título pode ter no máximo 200 caracteres.'),
  categorySlug: z.string().trim().min(1, 'Selecione uma categoria.'),
  content: z.string(),
  headerImageAlt: z
    .string()
    .trim()
    .max(255, 'O texto alternativo pode ter no máximo 255 caracteres.'),
  status: z.enum(['draft', 'published']),
})

type BlogArticleFormValues = z.infer<typeof blogArticleFormSchema>

interface BlogArticleFormProps {
  article?: BlogArticle | undefined
  isSubmitting: boolean
  onSubmit: (input: BlogArticleFormInput) => void
  onCancel: () => void
  submitLabel?: string
}

export function BlogArticleForm({
  article,
  isSubmitting,
  onSubmit,
  onCancel,
  submitLabel,
}: BlogArticleFormProps) {
  const isEditing = article !== undefined

  const categoriesQuery = useQuery(categoriesListQuery())
  const categories = categoriesQuery.data?.categories ?? []

  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null)
  const [removeHeaderImage, setRemoveHeaderImage] = useState(false)

  const defaultValues: BlogArticleFormValues = {
    title: article?.title ?? '',
    categorySlug: article?.categorySlug ?? '',
    content: article?.content ?? '',
    headerImageAlt: article?.headerImageAlt ?? '',
    status: article?.status ?? 'draft',
  }

  const form = useForm<BlogArticleFormValues>({
    resolver: zodResolver(blogArticleFormSchema),
    defaultValues,
  })

  const handleValidSubmit: SubmitHandler<BlogArticleFormValues> = (values) => {
    const sanitized = sanitizeContent(values.content)

    if (values.status === 'published' && stripHtml(sanitized).length === 0) {
      form.setError('content', {
        type: 'manual',
        message: 'Escreva o conteúdo antes de publicar o artigo.',
      })
      return
    }

    onSubmit({
      title: values.title.trim(),
      categorySlug: values.categorySlug,
      content: sanitized,
      headerImageAlt: values.headerImageAlt,
      status: values.status,
      headerImageFile,
      removeHeaderImage,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValidSubmit)}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Como escolher estruturas metálicas para sua obra"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O slug do artigo será gerado automaticamente a partir do
                    título.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      ariaInvalid={Boolean(fieldState.error)}
                      placeholder="Escreva o artigo usando os comandos da barra superior. Você pode inserir títulos, listas, imagens e ênfases."
                    />
                  </FormControl>
                  <FormDescription>
                    O conteúdo aceita negrito, itálico, títulos (H1, H2 e H3),
                    listas com marcadores e imagens enviadas pelo editor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <FormLabel asChild>
                            <Label htmlFor="blog-status-switch">
                              Publicar artigo
                            </Label>
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Se desligado, o artigo fica como rascunho e não
                            aparece para os visitantes.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            id="blog-status-switch"
                            checked={field.value === 'published'}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? 'published' : 'draft')
                            }
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting || categoriesQuery.isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                categoriesQuery.isPending
                                  ? 'Carregando categorias...'
                                  : 'Selecione uma categoria'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.slug}
                              value={category.slug}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!categoriesQuery.isPending && categories.length === 0 ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
                  >
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                    <div className="space-y-2">
                      <p className="font-medium leading-tight">
                        Nenhuma categoria cadastrada
                      </p>
                      <p className="text-xs leading-relaxed">
                        Você precisa cadastrar pelo menos uma categoria antes
                        de criar um artigo. As categorias também precisam
                        estar publicadas na landing page.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1 border-amber-300 bg-white text-amber-900 hover:bg-amber-50 hover:text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100 dark:hover:bg-amber-950/80"
                      >
                        <Link to="/conteudo/categorias">
                          <ExternalLink className="size-3.5" />
                          Criar categoria
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    role="note"
                    className="flex items-start gap-2.5 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground"
                  >
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <p className="leading-relaxed">
                      Apenas categorias já publicadas na landing page são
                      aceitas. Para gerenciar a lista,{' '}
                      <Link
                        to="/conteudo/categorias"
                        className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        abra a página de categorias
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1">
                  <Label>Imagem de capa</Label>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. A imagem é convertida para WebP antes do
                    upload.
                  </p>
                </div>

                <Controller
                  control={form.control}
                  name="headerImageAlt"
                  render={() => (
                    <HeaderImageField
                      existingUrl={article?.headerImageUrl ?? null}
                      existingAlt={article?.headerImageAlt ?? null}
                      file={headerImageFile}
                      removed={removeHeaderImage}
                      disabled={isSubmitting}
                      onFileChange={setHeaderImageFile}
                      onRemoveExisting={setRemoveHeaderImage}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="headerImageAlt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto alternativo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Descreva a imagem para acessibilidade"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel ?? (isEditing ? 'Salvar alterações' : 'Criar artigo')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
