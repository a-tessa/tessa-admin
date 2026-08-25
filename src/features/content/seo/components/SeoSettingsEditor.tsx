import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import { AlertCircle, ChevronDown, Loader2, RotateCcw, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { useRegisterPublicationEditorState } from '@/features/content/publish/publication-readiness'
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
  CardHeader,
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
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { env } from '@/shared/config/env'
import {
  useDeletePageSeoOgImage,
  useDeleteSeoDefaultOgImage,
  usePageSeo,
  useSavePageSeo,
  useSaveSeoDefaults,
  useSeoDefaults,
  useUploadPageSeoOgImage,
  useUploadSeoDefaultOgImage,
} from '../hooks/use-seo-settings'
import { runSeoChecks } from '../lib/seo-checks'
import {
  HARD_DESCRIPTION_MAX,
  HARD_TITLE_MAX,
  measureTextWidth,
  RECOMMENDED_DESCRIPTION_MAX,
  RECOMMENDED_TITLE_MAX,
  SERP_DESCRIPTION_DESKTOP_PX,
  SERP_DESCRIPTION_FONT,
  SERP_TITLE_DESKTOP_PX,
  SERP_TITLE_FONT,
} from '../lib/text-width'
import {
  defaultPageSeoFormValues,
  defaultSeoDefaultsFormValues,
  MAX_SEO_FOCUS_KEYWORD_LENGTH,
  MAX_SEO_META_DESCRIPTION_LENGTH,
  MAX_SEO_META_TITLE_LENGTH,
  MAX_SEO_SITE_NAME_LENGTH,
  MAX_SEO_SOCIAL_DESCRIPTION_LENGTH,
  MAX_SEO_SOCIAL_TITLE_LENGTH,
  MAX_SEO_TITLE_TEMPLATE_LENGTH,
  MAX_SEO_VERIFICATION_LENGTH,
  normalizeCanonicalInput,
  pageSeoFormSchema,
  RECOMMENDED_SOCIAL_DESCRIPTION_MAX,
  RECOMMENDED_SOCIAL_TITLE_MAX,
  seoDefaultsFormSchema,
  SEO_ROBOTS_OPTIONS,
  toPageSeoFormValues,
  toPageSeoInput,
  toSeoDefaultsFormValues,
  toSeoDefaultsInput,
  type PageSeoFormValues,
  type SeoDefaultsFormValues,
} from '../seo.schema'
import {
  SEO_PAGE_KEYS,
  SEO_PAGE_LABELS,
  SEO_PAGE_PATHS,
  SEO_PAGE_PLACEHOLDERS,
  type PageSeo,
  type SeoPageKey,
} from '../types'
import { SeoAutomaticCard } from './SeoAutomaticCard'
import { SeoChecklistCard } from './SeoChecklistCard'
import { SeoFieldMeter } from './SeoFieldMeter'
import { SeoOgImageField } from './SeoOgImageField'
import { SerpPreview } from './SerpPreview'

function EditorSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

function toChecksPageSeo(values: PageSeoFormValues): PageSeo {
  return toPageSeoInput(values)
}

export function SeoSettingsEditor() {
  const defaultsQuery = useSeoDefaults()
  const pagesQuery = usePageSeo()
  const hasDefaults = defaultsQuery.data !== null && defaultsQuery.data !== undefined
  const hasPages = Object.keys(pagesQuery.data ?? {}).length > 0
  const saveDefaultsMutation = useSaveSeoDefaults(hasDefaults)
  const savePagesMutation = useSavePageSeo(hasPages)
  const uploadDefaultOg = useUploadSeoDefaultOgImage()
  const deleteDefaultOg = useDeleteSeoDefaultOgImage()
  const uploadPageOg = useUploadPageSeoOgImage()
  const deletePageOg = useDeletePageSeoOgImage()

  const defaultsForm = useForm<SeoDefaultsFormValues>({
    resolver: zodResolver(seoDefaultsFormSchema),
    defaultValues: defaultSeoDefaultsFormValues,
    mode: 'onBlur',
  })
  const pagesForm = useForm<PageSeoFormValues>({
    resolver: zodResolver(pageSeoFormSchema),
    defaultValues: defaultPageSeoFormValues,
    mode: 'onBlur',
  })

  const defaultsDirty = defaultsForm.formState.isDirty
  const pagesDirty = pagesForm.formState.isDirty
  const isDirty = defaultsDirty || pagesDirty

  useBlocker({
    shouldBlockFn: (): boolean =>
      isDirty &&
      !window.confirm(
        'Há alterações não salvas no SEO. Deseja descartá-las?',
      ),
    enableBeforeUnload: isDirty,
    disabled: !isDirty,
  })

  useEffect((): void => {
    if (!defaultsQuery.isSuccess) return
    defaultsForm.reset(toSeoDefaultsFormValues(defaultsQuery.data))
  }, [defaultsForm, defaultsQuery.data, defaultsQuery.isSuccess])

  useEffect((): void => {
    if (!pagesQuery.isSuccess) return
    pagesForm.reset(toPageSeoFormValues(pagesQuery.data))
  }, [pagesForm, pagesQuery.data, pagesQuery.isSuccess])

  const watchedDefaults = useWatch({ control: defaultsForm.control })
  const watchedPages = useWatch({ control: pagesForm.control })

  const checks = useMemo(
    () =>
      runSeoChecks({
        seoDefaults: {
          siteName: watchedDefaults.siteName ?? '',
          titleTemplate: watchedDefaults.titleTemplate ?? '',
          defaultMetaDescription: watchedDefaults.defaultMetaDescription ?? '',
          allowIndexing: watchedDefaults.allowIndexing ?? true,
          twitterSite: watchedDefaults.twitterSite ?? '',
          ...(watchedDefaults.defaultOgImageUrl
            ? { defaultOgImageUrl: watchedDefaults.defaultOgImageUrl }
            : {}),
        },
        pageSeo: toChecksPageSeo(
          (watchedPages as PageSeoFormValues | undefined) ??
            defaultPageSeoFormValues,
        ),
      }),
    [watchedDefaults, watchedPages],
  )

  const defaultsInvalid =
    defaultsForm.formState.submitCount > 0 &&
    Object.keys(defaultsForm.formState.errors).length > 0
  const pagesInvalid =
    pagesForm.formState.submitCount > 0 &&
    Object.keys(pagesForm.formState.errors).length > 0

  useRegisterPublicationEditorState({
    id: 'seo-defaults',
    label: 'Padrões globais de SEO',
    tab: 'seo',
    isDirty: defaultsDirty,
    isInvalid: defaultsInvalid,
    isUploading: saveDefaultsMutation.isPending || uploadDefaultOg.isPending,
  })
  useRegisterPublicationEditorState({
    id: 'page-seo',
    label: 'SEO da página',
    tab: 'seo',
    isDirty: pagesDirty,
    isInvalid: pagesInvalid,
    isUploading: savePagesMutation.isPending || uploadPageOg.isPending,
  })

  function handleSaveDefaults(values: SeoDefaultsFormValues): void {
    saveDefaultsMutation.mutate(toSeoDefaultsInput(values), {
      onSuccess: (response): void => {
        defaultsForm.reset(toSeoDefaultsFormValues(response.seoDefaults))
        toast.success('Rascunho dos padrões globais de SEO salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  function handleSavePages(values: PageSeoFormValues): void {
    savePagesMutation.mutate(toPageSeoInput(values), {
      onSuccess: (response): void => {
        pagesForm.reset(toPageSeoFormValues(response.pageSeo))
        toast.success('Rascunho do SEO das páginas salvo.')
      },
      onError: (error: Error): void => {
        toast.error(error.message)
      },
    })
  }

  if (defaultsQuery.isPending || pagesQuery.isPending) {
    return <EditorSkeleton />
  }

  if (defaultsQuery.isError || pagesQuery.isError) {
    const message =
      defaultsQuery.error?.message ?? pagesQuery.error?.message ?? 'Erro ao carregar.'
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar o SEO</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(): void => {
              void defaultsQuery.refetch()
              void pagesQuery.refetch()
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <SeoDefaultsCard
          form={defaultsForm}
          hasSection={hasDefaults}
          isSaving={saveDefaultsMutation.isPending}
          saveError={saveDefaultsMutation.error?.message}
          onSubmit={handleSaveDefaults}
          onUploadOg={async (file, onProgress): Promise<string> => {
            const response = await uploadDefaultOg.mutateAsync({
              file,
              onProgress,
            })
            const url = response.seoDefaults.defaultOgImageUrl ?? ''
            defaultsForm.setValue('defaultOgImageUrl', url, {
              shouldDirty: false,
            })
            return url
          }}
          onDeleteOg={async (): Promise<void> => {
            await deleteDefaultOg.mutateAsync()
            defaultsForm.setValue('defaultOgImageUrl', '', { shouldDirty: false })
          }}
        />

        <PageSeoCard
          form={pagesForm}
          savedPages={pagesQuery.data}
          titleTemplate={watchedDefaults.titleTemplate ?? '%s | Tessa'}
          siteName={watchedDefaults.siteName ?? 'Tessa'}
          isSaving={savePagesMutation.isPending}
          saveError={savePagesMutation.error?.message}
          onSubmit={handleSavePages}
          onUploadOg={async (pageKey, file, onProgress): Promise<string> => {
            const response = await uploadPageOg.mutateAsync({
              pageKey,
              file,
              onProgress,
            })
            const url = response.pageSeo[pageKey]?.ogImageUrl ?? ''
            pagesForm.setValue(`pages.${pageKey}.ogImageUrl`, url, {
              shouldDirty: false,
            })
            return url
          }}
          onDeleteOg={async (pageKey): Promise<void> => {
            await deletePageOg.mutateAsync(pageKey)
            pagesForm.setValue(`pages.${pageKey}.ogImageUrl`, '', {
              shouldDirty: false,
            })
          }}
        />
      </div>

      <div className="space-y-6 xl:sticky xl:top-4 xl:self-start">
        <SeoChecklistCard checks={checks} />
        <SeoAutomaticCard />
      </div>
    </div>
  )
}

function SeoDefaultsCard({
  form,
  hasSection,
  isSaving,
  saveError,
  onSubmit,
  onUploadOg,
  onDeleteOg,
}: {
  readonly form: UseFormReturn<SeoDefaultsFormValues>
  readonly hasSection: boolean
  readonly isSaving: boolean
  readonly saveError: string | undefined
  readonly onSubmit: (values: SeoDefaultsFormValues) => void
  readonly onUploadOg: (
    file: File,
    onProgress: (percentage: number) => void,
  ) => Promise<string>
  readonly onDeleteOg: () => Promise<void>
}) {
  const siteName = useWatch({ control: form.control, name: 'siteName' })
  const titleTemplate = useWatch({
    control: form.control,
    name: 'titleTemplate',
  })
  const description = useWatch({
    control: form.control,
    name: 'defaultMetaDescription',
  })
  const ogImageUrl = useWatch({
    control: form.control,
    name: 'defaultOgImageUrl',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Padrões globais de SEO</CardTitle>
        <CardDescription>
          Nome, modelo de título, descrição padrão, palavras-chave, verificação
          do Search Console e imagem Open Graph usada quando a página não tem
          uma própria. Título e descrição vão para en/es na publicação; o nome
          do site e o modelo não são traduzidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {saveError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Nome do site</FormLabel>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(siteName.length)} / {String(MAX_SEO_SITE_NAME_LENGTH)}
                    </span>
                  </div>
                  <FormControl>
                    <Input maxLength={MAX_SEO_SITE_NAME_LENGTH} {...field} />
                  </FormControl>
                  <FormDescription>
                    Aparece no Open Graph e nos dados estruturados do site.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titleTemplate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Modelo de título</FormLabel>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(titleTemplate.length)} /{' '}
                      {String(MAX_SEO_TITLE_TEMPLATE_LENGTH)}
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      maxLength={MAX_SEO_TITLE_TEMPLATE_LENGTH}
                      placeholder="%s | Tessa"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use %s no lugar do título da página. Exemplo: %s | Tessa.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultMetaDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Descrição padrão</FormLabel>
                    <SeoFieldMeter
                      currentChars={description.length}
                      recommendedMax={RECOMMENDED_DESCRIPTION_MAX}
                      hardMax={HARD_DESCRIPTION_MAX}
                      currentPx={measureTextWidth(
                        description,
                        SERP_DESCRIPTION_FONT,
                      )}
                      maxPx={SERP_DESCRIPTION_DESKTOP_PX}
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={MAX_SEO_META_DESCRIPTION_LENGTH}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Usada quando uma página ainda não tem descrição própria. Não
                    ranqueia sozinha; ajuda o clique no resultado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywordsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palavras-chave</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Estrutura metálica para telhado, Carport"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separe por vírgula. O Google ignora este campo para
                    ranqueamento; o termo principal no título importa mais.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="googleSiteVerification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verificação do Google</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={MAX_SEO_VERIFICATION_LENGTH}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Conteúdo da meta google-site-verification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bingSiteVerification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verificação do Bing</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={MAX_SEO_VERIFICATION_LENGTH}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Conteúdo da meta msvalidate.01.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="twitterSite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle do X (Twitter)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="@tessaeng"
                      autoComplete="off"
                      spellCheck={false}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Vai em twitter:site no cartão de compartilhamento. Formato
                    @perfil, até 15 caracteres.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowIndexing"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="space-y-1">
                    <FormLabel>Permitir indexação</FormLabel>
                    <FormDescription>
                      Desligue só em manutenção. Isso fecha o site inteiro para
                      o Google.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Imagem Open Graph padrão</FormLabel>
              <FormDescription>
                Salve os padrões globais antes do primeiro envio. Recomendado
                1200 × 630.
              </FormDescription>
              <SeoOgImageField
                label="o site"
                url={ogImageUrl}
                disabled={!hasSection || isSaving}
                onUploaded={(url): void => {
                  form.setValue('defaultOgImageUrl', url, { shouldDirty: false })
                }}
                onRemoved={(): void => {
                  form.setValue('defaultOgImageUrl', '', { shouldDirty: false })
                }}
                onUpload={async (file, onProgress) => ({
                  url: await onUploadOg(file, onProgress),
                })}
                onDelete={onDeleteOg}
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              Salvar padrões globais
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PageSeoCard({
  form,
  savedPages,
  titleTemplate,
  siteName,
  isSaving,
  saveError,
  onSubmit,
  onUploadOg,
  onDeleteOg,
}: {
  readonly form: UseFormReturn<PageSeoFormValues>
  readonly savedPages: PageSeo
  readonly titleTemplate: string
  readonly siteName: string
  readonly isSaving: boolean
  readonly saveError: string | undefined
  readonly onSubmit: (values: PageSeoFormValues) => void
  readonly onUploadOg: (
    pageKey: SeoPageKey,
    file: File,
    onProgress: (percentage: number) => void,
  ) => Promise<string>
  readonly onDeleteOg: (pageKey: SeoPageKey) => Promise<void>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO por página</CardTitle>
        <CardDescription>
          Título, descrição e termo principal das rotas fixas. Artigos do blog e
          páginas de serviço continuam usando o próprio conteúdo. Salve a página
          antes de enviar a imagem Open Graph.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {saveError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            ) : null}

            {SEO_PAGE_KEYS.map((pageKey) => (
              <PageSeoFields
                key={pageKey}
                pageKey={pageKey}
                form={form}
                titleTemplate={titleTemplate}
                siteName={siteName}
                canUpload={Boolean(savedPages[pageKey])}
                disabled={isSaving}
                onUploadOg={onUploadOg}
                onDeleteOg={onDeleteOg}
              />
            ))}

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              Salvar SEO das páginas
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PageSeoFields({
  pageKey,
  form,
  titleTemplate,
  siteName,
  canUpload,
  disabled,
  onUploadOg,
  onDeleteOg,
}: {
  readonly pageKey: SeoPageKey
  readonly form: UseFormReturn<PageSeoFormValues>
  readonly titleTemplate: string
  readonly siteName: string
  readonly canUpload: boolean
  readonly disabled: boolean
  readonly onUploadOg: (
    pageKey: SeoPageKey,
    file: File,
    onProgress: (percentage: number) => void,
  ) => Promise<string>
  readonly onDeleteOg: (pageKey: SeoPageKey) => Promise<void>
}) {
  const title = useWatch({
    control: form.control,
    name: `pages.${pageKey}.metaTitle`,
  })
  const description = useWatch({
    control: form.control,
    name: `pages.${pageKey}.metaDescription`,
  })
  const socialTitle = useWatch({
    control: form.control,
    name: `pages.${pageKey}.socialTitle`,
  })
  const socialDescription = useWatch({
    control: form.control,
    name: `pages.${pageKey}.socialDescription`,
  })
  const ogImageUrl = useWatch({
    control: form.control,
    name: `pages.${pageKey}.ogImageUrl`,
  })
  const placeholder = SEO_PAGE_PLACEHOLDERS[pageKey]
  const [canonicalHint, setCanonicalHint] = useState<string | null>(null)

  function handleCanonicalBlur(value: string): void {
    const { canonicalUrl, convertedFromOwnHost } = normalizeCanonicalInput(
      value,
      env.publicSiteUrl,
    )
    if (canonicalUrl !== value) {
      form.setValue(`pages.${pageKey}.canonicalUrl`, canonicalUrl, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
    setCanonicalHint(
      convertedFromOwnHost
        ? 'Convertida para caminho interno: URL do próprio site precisa seguir o idioma do visitante, senão o hreflang contradiz a canonical.'
        : null,
    )
  }

  return (
    <Collapsible defaultOpen={pageKey === 'home'} className="rounded-lg border">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span>
          <span className="block text-sm font-medium">
            {SEO_PAGE_LABELS[pageKey]}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {SEO_PAGE_PATHS[pageKey]}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t px-4 py-4">
        <SerpPreview
          pageKey={pageKey}
          title={title}
          description={description}
          titleTemplate={titleTemplate}
          siteName={siteName}
        />

        <FormField
          control={form.control}
          name={`pages.${pageKey}.metaTitle`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>Título</FormLabel>
                <SeoFieldMeter
                  currentChars={title.length}
                  recommendedMax={RECOMMENDED_TITLE_MAX}
                  hardMax={HARD_TITLE_MAX}
                  currentPx={measureTextWidth(title, SERP_TITLE_FONT)}
                  maxPx={SERP_TITLE_DESKTOP_PX}
                />
              </div>
              <FormControl>
                <Input
                  maxLength={MAX_SEO_META_TITLE_LENGTH}
                  placeholder={placeholder.title}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comece com o termo principal. Não repetir a marca se o modelo já
                acrescenta “| Tessa”.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`pages.${pageKey}.metaDescription`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>Descrição</FormLabel>
                <SeoFieldMeter
                  currentChars={description.length}
                  recommendedMax={RECOMMENDED_DESCRIPTION_MAX}
                  hardMax={HARD_DESCRIPTION_MAX}
                  currentPx={measureTextWidth(
                    description,
                    SERP_DESCRIPTION_FONT,
                  )}
                  maxPx={SERP_DESCRIPTION_DESKTOP_PX}
                />
              </div>
              <FormControl>
                <Textarea
                  rows={3}
                  maxLength={MAX_SEO_META_DESCRIPTION_LENGTH}
                  placeholder={placeholder.description}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Texto cinza do resultado. Convence o clique; não é um fator
                direto de posição.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`pages.${pageKey}.focusKeyword`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termo principal</FormLabel>
              <FormControl>
                <Input
                  maxLength={MAX_SEO_FOCUS_KEYWORD_LENGTH}
                  placeholder="estruturas metálicas"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Frase que o assistente espera no começo do título. Não vira uma
                tag especial no Google.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={`pages.${pageKey}.changeFrequency`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequência no sitemap</FormLabel>
                <FormControl>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-input/20 px-2 text-sm"
                    {...field}
                  >
                    <option value="">Padrão da rota</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`pages.${pageKey}.priority`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade (0 a 1)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    placeholder={pageKey === 'home' ? '1' : '0.8'}
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
          name={`pages.${pageKey}.robots`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Robots</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-input/20 px-2 text-sm"
                  {...field}
                >
                  {SEO_ROBOTS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                index tira ou deixa a URL na busca e no sitemap. follow decide
                se os links da página passam autoridade.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`pages.${pageKey}.canonicalUrl`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canonical personalizada</FormLabel>
              <FormControl>
                <Input
                  placeholder="/servicos/estrutura-carport"
                  {...field}
                  onBlur={(event): void => {
                    field.onBlur()
                    handleCanonicalBlur(event.target.value)
                  }}
                />
              </FormControl>
              <FormDescription>
                Caminho interno segue o idioma do visitante. URL de outro
                domínio vai literal e desliga o hreflang.
              </FormDescription>
              {canonicalHint ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {canonicalHint}
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <Collapsible className="rounded-lg border">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left">
            <span className="text-sm font-medium">
              Compartilhamento em redes sociais
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 border-t px-3 py-3">
            <FormField
              control={form.control}
              name={`pages.${pageKey}.socialTitle`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Título social</FormLabel>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(socialTitle.length)} /{' '}
                      {String(RECOMMENDED_SOCIAL_TITLE_MAX)}
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      maxLength={MAX_SEO_SOCIAL_TITLE_LENGTH}
                      placeholder={title || placeholder.title}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Open Graph e Twitter. Vazio herda o título da página, sem o
                    modelo “| Tessa”.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`pages.${pageKey}.socialDescription`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Descrição social</FormLabel>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(socialDescription.length)} /{' '}
                      {String(RECOMMENDED_SOCIAL_DESCRIPTION_MAX)}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={MAX_SEO_SOCIAL_DESCRIPTION_LENGTH}
                      placeholder={description || placeholder.description}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Vazio herda a descrição da página.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Imagem Open Graph</FormLabel>
              <SeoOgImageField
                label={SEO_PAGE_LABELS[pageKey]}
                url={ogImageUrl}
                disabled={disabled || !canUpload}
                onUploaded={(url): void => {
                  form.setValue(`pages.${pageKey}.ogImageUrl`, url, {
                    shouldDirty: false,
                  })
                }}
                onRemoved={(): void => {
                  form.setValue(`pages.${pageKey}.ogImageUrl`, '', {
                    shouldDirty: false,
                  })
                }}
                onUpload={async (file, onProgress) => ({
                  url: await onUploadOg(pageKey, file, onProgress),
                })}
                onDelete={async (): Promise<void> => {
                  await onDeleteOg(pageKey)
                }}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CollapsibleContent>
    </Collapsible>
  )
}
